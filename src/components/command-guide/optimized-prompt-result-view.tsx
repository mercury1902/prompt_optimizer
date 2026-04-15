import React, { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, GitCompare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { ParsedPromptResult } from '../../utils/prompt-response-parser';
import { extractCommand, formatOptimizedPrompt } from '../../utils/prompt-response-parser';
import { useBilingualLanguageToggleState } from '../../hooks/use-bilingual-language-toggle-state';
import type {
  OptimizerDisplayMode,
  OptimizerPreviewMode,
  OutputLanguageMode,
} from '../../types/prompt-optimizer-multilingual';

interface OptimizedResultViewProps {
  result: ParsedPromptResult;
  originalInput: string;
  compareMode?: boolean;
  outputLanguageMode: OutputLanguageMode;
  displayMode: OptimizerDisplayMode;
  previewMode: OptimizerPreviewMode;
}

interface PromptDiff {
  added: string[];
  removed: string[];
}

function computePromptDiff(originalPrompt: string, optimizedPrompt: string): PromptDiff {
  const originalLines = originalPrompt.split('\n').map((line) => line.trim()).filter(Boolean);
  const optimizedLines = optimizedPrompt.split('\n').map((line) => line.trim()).filter(Boolean);
  const originalSet = new Set(originalLines);
  const optimizedSet = new Set(optimizedLines);

  return {
    added: optimizedLines.filter((line) => !originalSet.has(line)),
    removed: originalLines.filter((line) => !optimizedSet.has(line)),
  };
}

function HighlightedBlock({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
      <SyntaxHighlighter
        language="markdown"
        style={oneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          background: 'transparent',
          padding: 0,
        }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' } }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

function buildCopyBothMarkdown(englishPrompt: string, vietnamesePrompt: string): string {
  return `## English Prompt\n${englishPrompt}\n\n## Vietnamese Prompt\n${vietnamesePrompt}`;
}

function languageLabel(code: 'en' | 'vi'): string {
  return code === 'en' ? 'English' : 'Tiếng Việt';
}

export const OptimizedResultView: React.FC<OptimizedResultViewProps> = ({
  result,
  originalInput,
  compareMode = false,
  outputLanguageMode,
  displayMode,
  previewMode,
}) => {
  const { t } = useBilingualLanguageToggleState();
  const [copiedType, setCopiedType] = useState<'en' | 'vi' | 'both' | null>(null);
  const [tabLanguage, setTabLanguage] = useState<'en' | 'vi'>('en');

  const optimizedPromptEn = useMemo(
    () => formatOptimizedPrompt(result.optimizedPromptEn || result.optimizedPrompt || ''),
    [result.optimizedPrompt, result.optimizedPromptEn],
  );

  const optimizedPromptVi = useMemo(
    () => formatOptimizedPrompt(result.optimizedPromptVi || result.optimizedPrompt || ''),
    [result.optimizedPrompt, result.optimizedPromptVi],
  );

  const hasBilingualResult = optimizedPromptEn.length > 0 && optimizedPromptVi.length > 0;
  const command = useMemo(() => extractCommand(result.suggestedCommand), [result.suggestedCommand]);

  const primaryPrompt = useMemo(() => {
    if (outputLanguageMode === 'vi') {
      return optimizedPromptVi || optimizedPromptEn;
    }
    return optimizedPromptEn || optimizedPromptVi;
  }, [optimizedPromptEn, optimizedPromptVi, outputLanguageMode]);

  const comparePrompt = useMemo(() => {
    if (previewMode === 'english') {
      return optimizedPromptEn || optimizedPromptVi;
    }
    return primaryPrompt;
  }, [optimizedPromptEn, optimizedPromptVi, previewMode, primaryPrompt]);

  const diff = useMemo(() => computePromptDiff(originalInput, comparePrompt), [originalInput, comparePrompt]);

  const copyText = async (type: 'en' | 'vi' | 'both') => {
    const copyPayload =
      type === 'en'
        ? optimizedPromptEn
        : type === 'vi'
          ? optimizedPromptVi
          : buildCopyBothMarkdown(optimizedPromptEn, optimizedPromptVi);

    if (!copyPayload.trim()) {
      toast.error('Không có nội dung để sao chép');
      return;
    }

    try {
      await navigator.clipboard.writeText(copyPayload);
      setCopiedType(type);
      toast.success(t('optimizer.copy.done', 'Đã sao chép!'));
      window.setTimeout(() => setCopiedType(null), 1800);
    } catch {
      toast.error('Không thể sao chép vào clipboard');
    }
  };

  const shouldRenderBilingual = hasBilingualResult && previewMode === 'bilingual';
  const singlePromptLanguage = outputLanguageMode === 'vi' ? 'vi' : 'en';
  const singlePrompt = singlePromptLanguage === 'vi' ? optimizedPromptVi || optimizedPromptEn : optimizedPromptEn || optimizedPromptVi;

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-soft)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--app-text)]">
          {compareMode ? <GitCompare className="h-4.5 w-4.5 text-[var(--accent)]" /> : <Sparkles className="h-4.5 w-4.5 text-[var(--accent)]" />}
          <span>{compareMode ? 'Compare Mode' : 'Prompt đã tối ưu'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void copyText('en')}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--app-surface))]"
          >
            {copiedType === 'en' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedType === 'en' ? 'Copied EN' : 'Copy EN'}</span>
          </button>
          <button
            type="button"
            onClick={() => void copyText('vi')}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--app-surface))]"
          >
            {copiedType === 'vi' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedType === 'vi' ? 'Copied VI' : 'Copy VI'}</span>
          </button>
          {hasBilingualResult && (
            <button
              type="button"
              onClick={() => void copyText('both')}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_13%,var(--app-surface))] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_22%,var(--app-surface))]"
            >
              {copiedType === 'both' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedType === 'both' ? 'Copied Both' : 'Copy Both'}</span>
            </button>
          )}
        </div>
      </div>

      {compareMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Original
              </p>
              <HighlightedBlock content={originalInput || '(Trống)'} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Optimized ({languageLabel(previewMode === 'english' ? 'en' : singlePromptLanguage)})
              </p>
              <HighlightedBlock content={comparePrompt || '(Trống)'} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-rose-300/45 bg-rose-50/80 p-3 dark:border-rose-900/55 dark:bg-rose-950/35">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-200">
                Removed
              </p>
              {diff.removed.length === 0 ? (
                <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-200/85">Không có dòng bị bỏ.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-rose-700 dark:text-rose-200">
                  {diff.removed.map((line) => (
                    <li key={`removed-${line}`} className="rounded-md bg-rose-100 px-2 py-1 dark:bg-rose-900/55">
                      - {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-emerald-300/45 bg-emerald-50/80 p-3 dark:border-emerald-900/55 dark:bg-emerald-950/35">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                Added
              </p>
              {diff.added.length === 0 ? (
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/85">Không có dòng mới.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-200">
                  {diff.added.map((line) => (
                    <li key={`added-${line}`} className="rounded-md bg-emerald-100 px-2 py-1 dark:bg-emerald-900/55">
                      + {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {shouldRenderBilingual ? (
            <>
              {displayMode === 'side-by-side' && (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">English</p>
                    <HighlightedBlock content={optimizedPromptEn || '(Trống)'} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Tiếng Việt</p>
                    <HighlightedBlock content={optimizedPromptVi || '(Trống)'} />
                  </div>
                </div>
              )}

              {displayMode === 'tab-toggle' && (
                <div className="space-y-3">
                  <div className="inline-flex rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-1">
                    <button
                      type="button"
                      onClick={() => setTabLanguage('en')}
                      className={`min-h-10 rounded-lg px-3 py-2 text-xs font-semibold ${
                        tabLanguage === 'en'
                          ? 'bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] text-[var(--app-text)]'
                          : 'text-[var(--app-text-muted)]'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setTabLanguage('vi')}
                      className={`min-h-10 rounded-lg px-3 py-2 text-xs font-semibold ${
                        tabLanguage === 'vi'
                          ? 'bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] text-[var(--app-text)]'
                          : 'text-[var(--app-text-muted)]'
                      }`}
                    >
                      Tiếng Việt
                    </button>
                  </div>
                  <HighlightedBlock content={tabLanguage === 'en' ? optimizedPromptEn : optimizedPromptVi} />
                </div>
              )}

              {displayMode === 'inline-translation' && (
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">English</p>
                    <HighlightedBlock content={optimizedPromptEn || '(Trống)'} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Tiếng Việt</p>
                    <HighlightedBlock content={optimizedPromptVi || '(Trống)'} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                {singlePromptLanguage === 'vi' ? 'Tiếng Việt' : 'English'}
              </p>
              <HighlightedBlock content={singlePrompt || '(Không có nội dung)'} />
            </div>
          )}

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              Command đề xuất
            </p>
            <code className="mt-1 block text-sm font-semibold text-[var(--accent)]">{command}</code>
          </div>

          {result.explanation && (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Lý do
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--app-text)]">{result.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedResultView;
