import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { applyRestrictedCorsHeaders, verifyCronAuth } from '../src/utils/authSecurity.js';
import {
  CheckpointStore,
  FileCheckpointStore,
  FileJobLockStore,
  JobLockStore,
  classifyAutomationError,
  runCheckpointedAutomationJob
} from '../src/utils/automationPipeline.js';
import { recordOperationalEvent, redactSensitiveData } from '../src/utils/operationalObservability.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';

export interface CronTopic {
  from: string;
  to: string;
  type: string;
}

const DEFAULT_TRENDING_TOPICS: CronTopic[] = [
  { from: 'India', to: 'UAE', type: 'Dubai Tourist Visa' },
  { from: 'India', to: 'Canada', type: 'Work Visa' },
  { from: 'India', to: 'USA', type: 'Student Visa' },
  { from: 'India', to: 'UK', type: 'Visitor Visa' },
  { from: 'USA', to: 'Schengen', type: 'Tourist Visa' }
];

export interface CronHandlerDependencies {
  lockStore?: JobLockStore;
  checkpointStore?: CheckpointStore;
  checkpointId?: string;
  topics?: CronTopic[];
  generateTopicContent?: (topic: CronTopic, signal: AbortSignal) => Promise<string>;
  maxAttempts?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
}

export function createCronHandler(deps: CronHandlerDependencies = {}) {
  const lockStore = deps.lockStore || new FileJobLockStore();
  const checkpointStore = deps.checkpointStore || new FileCheckpointStore();
  const topics = deps.topics || DEFAULT_TRENDING_TOPICS;

  return async function cronHandler(req: VercelRequest, res: VercelResponse) {
    applyRestrictedCorsHeaders(
      req,
      res,
      'GET, POST, OPTIONS',
      'Content-Type, Authorization, X-Cron-Secret'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();

    const auth = verifyCronAuth(req, { allowedMethods: ['GET', 'POST'] });
    if (!auth.authorized) {
      return res.status(auth.statusCode).json({
        success: false,
        status: auth.status,
        error: redactSensitiveData(auth.message)
      });
    }

    const startMs = Date.now();
    const runId = `vercel-cron-${crypto.randomUUID()}`;

    try {
      const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
      if (!GEMINI_KEY || GEMINI_KEY === 'dummy_key') {
        recordOperationalEvent({
          category: 'CRON_EXECUTION',
          severity: 'ERROR',
          component: 'api/cron',
          message: 'Aborted cron draft generation: GEMINI_API_KEY missing (fail-closed).'
        });
        return res.status(503).json({
          success: false,
          runId,
          failureClass: 'MISSING_CREDENTIALS',
          error: 'GEMINI_API_KEY is not configured in environment.'
        });
      }

      const todayDate = new Date().toISOString().split('T')[0];
      const checkpointId = deps.checkpointId || `api-cron-${todayDate}`;

      const defaultGenerator = async (topic: CronTopic, signal: AbortSignal): Promise<string> => {
        if (signal.aborted) {
          throw new Error('Request aborted before Gemini call');
        }
        const ai = new GoogleGenAI({
          apiKey: GEMINI_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const prompt = `Write a detailed 800-word SEO visa guide for ${topic.from} to ${topic.to} ${topic.type} 2026. Include: fees, documents, processing time, eligibility, application steps, tips. Use markdown. Make it helpful, accurate, human-like. Only cite verifiable consular facts. Title: ${topic.from} to ${topic.to} ${topic.type} Guide 2026`;
        const response: any = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW
            }
          }
        });
        const text = String(response?.text || '').trim();
        if (text.length <= 100) {
          throw new Error('VALIDATION_ERROR: Gemini returned insufficient draft content');
        }
        return text;
      };

      const generateFn = deps.generateTopicContent || defaultGenerator;
      const drafts: any[] = [];
      const failedTopics: Array<{ topic: string; failureClass?: string; error?: string }> = [];

      const jobResult = await runCheckpointedAutomationJob<CronTopic, any>({
        jobName: 'vercel-cron-drafts',
        checkpointId,
        lockKey: 'lock:vercel-cron-drafts',
        lockTtlMs: 4 * 60 * 1000,
        runId,
        items: topics,
        lockStore,
        checkpointStore,
        getItemKey: (t) =>
          `${t.from.toLowerCase()}-to-${t.to.toLowerCase()}-${t.type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        getIdempotencyKey: (t) =>
          `${todayDate}:${t.from.toLowerCase()}:${t.to.toLowerCase()}:${t.type.toLowerCase()}`,
        retryOptions: {
          maxAttempts: deps.maxAttempts ?? 3,
          timeoutMs: deps.timeoutMs ?? 25000,
          baseDelayMs: deps.baseDelayMs ?? 500,
          maxDelayMs: 6000
        },
        processItem: async (topic, signal) => {
          const content = await generateFn(topic, signal);
          const routeSlug = `${topic.from.toLowerCase()}-to-${topic.to.toLowerCase()}-${topic.type
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-${todayDate}`;
          const draft = {
            id: `draft-${routeSlug}`,
            title: `${topic.from} to ${topic.to} ${topic.type} 2026 - Complete Guide`,
            route: routeSlug,
            visaType: topic.type,
            content,
            date: new Date().toISOString(),
            status: 'PENDING_HUMAN_REVIEW',
            reviewRequired: true,
            autoPublished: false,
            fees: 'Verify on official embassy portal before publication',
            docs: 'Passport, Financial Proofs, Application Form'
          };
          drafts.push(draft);
          return draft;
        }
      });

      if (jobResult.status === 'DUPLICATE_IN_PROGRESS') {
        return res.status(409).json({
          success: false,
          runId,
          status: 'DUPLICATE_IN_PROGRESS',
          error: 'Cron job already executing; overlapping run rejected.'
        });
      }

      for (const outcome of jobResult.outcomes) {
        if (outcome.status === 'FAILED_QUARANTINED') {
          failedTopics.push({
            topic: outcome.key,
            failureClass: outcome.failureClass,
            error: redactSensitiveData(outcome.errorMessage || 'Failed')
          });
        }
      }

      recordOperationalEvent({
        category: 'CRON_EXECUTION',
        severity: jobResult.failedCount > 0 ? 'WARN' : 'INFO',
        component: 'api/cron',
        message: `Run ${runId} finished: status=${jobResult.status}, created=${drafts.length}, skipped=${jobResult.skippedCount}, failed=${jobResult.failedCount}`,
        details: {
          runId,
          durationMs: Date.now() - startMs,
          status: jobResult.status
        }
      });

      if (drafts.length === 0 && jobResult.skippedCount === 0) {
        const firstFailure = failedTopics[0]?.failureClass;
        const statusCode = firstFailure === 'QUOTA_EXHAUSTED' ? 429 : 502;
        return res.status(statusCode).json({
          success: false,
          runId,
          status: jobResult.status,
          failureClass: firstFailure || 'UNKNOWN_ERROR',
          error: 'Gemini generation failed for all topics; zero drafts created.',
          failedTopics
        });
      }

      return res.status(200).json({
        success: true,
        runId,
        status: jobResult.status,
        resumedFromCheckpoint: jobResult.resumedFromCheckpoint,
        message: `Processed ${jobResult.totalItems} topics (created=${drafts.length}, skippedIdempotent=${jobResult.skippedCount}, failed=${jobResult.failedCount}) pending human review`,
        drafts,
        count: drafts.length,
        skippedCount: jobResult.skippedCount,
        failedTopics,
        executionDurationMs: Date.now() - startMs
      });
    } catch (error: any) {
      const classified = classifyAutomationError(error);
      recordOperationalEvent({
        category: 'CRON_EXECUTION',
        severity: 'ERROR',
        component: 'api/cron',
        message: `Unhandled cron error (${classified.failureClass}): ${classified.message}`
      });
      return res.status(classified.httpStatus || 500).json({
        success: false,
        runId,
        failureClass: classified.failureClass,
        error: classified.message || 'Cron execution failed'
      });
    }
  };
}

export default createCronHandler();
