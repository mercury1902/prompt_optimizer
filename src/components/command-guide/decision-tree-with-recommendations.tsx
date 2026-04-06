import React, { useState } from 'react';
import { HelpCircle, ArrowRight, CheckCircle, RotateCcw, Terminal } from 'lucide-react';
import type { Command } from '../../data/claudekit-full-commands-catalog';
import { commands } from '../../data/claudekit-full-commands-catalog';

interface DecisionNode {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    nextNode?: string;
    commandId?: string;
    description?: string;
  }[];
}

const decisionTree: DecisionNode[] = [
  {
    id: 'start',
    question: 'Bạn muốn làm gì?',
    options: [
      { label: 'Triển khai tính năng mới', value: 'implement', nextNode: 'implement-type' },
      { label: 'Sửa lỗi / Debug', value: 'fix', nextNode: 'fix-type' },
      { label: 'Tìm hiểu / Hỏi đáp', value: 'learn', nextNode: 'learn-type' },
      { label: 'Review / Kiểm tra', value: 'review', nextNode: 'review-type' },
      { label: 'Triển khai / Deploy', value: 'deploy', nextNode: 'deploy-type' },
    ],
  },
  {
    id: 'implement-type',
    question: 'Bạn cần triển khai như thế nào?',
    options: [
      { label: 'Triển khai đầy đủ từ A-Z', value: 'full', commandId: 'ck:cook', description: '/ck:cook - End-to-end implementation' },
      { label: 'Cần lập kế hoạch trước', value: 'plan', commandId: 'ck:plan', description: '/ck:plan - Intelligent planning' },
      { label: 'Project mới hoàn toàn', value: 'new', commandId: 'ck:bootstrap', description: '/ck:bootstrap - Bootstrap new project' },
      { label: 'Theo plan đã có sẵn', value: 'from-plan', commandId: 'ck:code', description: '/ck:code - Execute existing plan' },
    ],
  },
  {
    id: 'fix-type',
    question: 'Lỗi bạn gặp thuộc loại nào?',
    options: [
      { label: 'TypeScript / Type errors', value: 'types', commandId: 'ck:fix:types', description: '/ck:fix:types - Fix TypeScript errors' },
      { label: 'UI / Layout / CSS', value: 'ui', commandId: 'ck:fix:ui', description: '/ck:fix:ui - Fix UI/UX issues' },
      { label: 'CI/CD / GitHub Actions', value: 'ci', commandId: 'ck:fix:ci', description: '/ck:fix:ci - Fix CI/CD pipeline' },
      { label: 'Tests failing', value: 'test', commandId: 'ck:fix:test', description: '/ck:fix:test - Fix failing tests' },
      { label: 'Lỗi phức tạp / Khó debug', value: 'complex', commandId: 'ck:debug', description: '/ck:debug - Deep debug analysis' },
      { label: 'Không rõ nguyên nhân', value: 'unknown', commandId: 'ck:fix', description: '/ck:fix - Intelligent routing' },
    ],
  },
  {
    id: 'learn-type',
    question: 'Bạn muốn tìm hiểu điều gì?',
    options: [
      { label: 'Câu hỏi nhanh về code', value: 'ask-code', commandId: 'ck:ask', description: '/ck:ask - Quick technical answers' },
      { label: 'Research công nghệ mới', value: 'research', commandId: 'ck:research', description: '/ck:research - Deep research' },
      { label: 'Giải thích code phức tạp', value: 'explain', commandId: 'ck:explain', description: '/ck:explain - Visual explanations' },
      { label: 'Tìm trong docs', value: 'docs', commandId: 'ck:docs', description: '/ck:docs - Documentation search' },
    ],
  },
  {
    id: 'review-type',
    question: 'Bạn muốn review gì?',
    options: [
      { label: 'Code review PR', value: 'pr', commandId: 'ck:code-review', description: '/ck:code-review - Adversarial code review' },
      { label: 'Review trước khi ship', value: 'ship', commandId: 'ck:ship', description: '/ck:ship - Shipping pipeline' },
      { label: 'So sánh / Preview', value: 'preview', commandId: 'ck:preview', description: '/ck:preview - Visual comparison' },
    ],
  },
  {
    id: 'deploy-type',
    question: 'Bạn muốn triển khai ra đâu?',
    options: [
      { label: 'Triển khai production', value: 'prod', commandId: 'ck:deploy', description: '/ck:deploy - Deploy to platforms' },
      { label: 'Chuẩn bị ship / PR', value: 'ship', commandId: 'ck:ship', description: '/ck:ship - Shipping pipeline' },
    ],
  },
];

export const DecisionTreeWithRecommendations: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [history, setHistory] = useState<{ nodeId: string; answer: string }[]>([]);
  const [recommendedCommand, setRecommendedCommand] = useState<Command | null>(null);

  const currentNode = decisionTree.find((n) => n.id === currentNodeId);

  const handleOptionClick = (option: DecisionNode['options'][0]) => {
    if (option.commandId) {
      const command = commands.find((c) => c.id === option.commandId);
      setRecommendedCommand(command || null);
    } else if (option.nextNode) {
      setHistory([...history, { nodeId: currentNodeId, answer: option.label }]);
      setCurrentNodeId(option.nextNode);
    }
  };

  const handleReset = () => {
    setCurrentNodeId('start');
    setHistory([]);
    setRecommendedCommand(null);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prev = newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(prev?.nodeId || 'start');
      setRecommendedCommand(null);
    }
  };

  if (recommendedCommand) {
    return (
      <div className="rounded-2xl border border-brand-400/30 bg-gradient-to-br from-brand-400/20 to-brand-500/10 backdrop-blur-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-400/20 mb-4">
            <CheckCircle className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Command phù hợp!</h3>
          <p className="text-white/60">Dựa trên câu trả lời của bạn</p>
        </div>

        <div className="bg-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Terminal className="w-6 h-6 text-brand-400" />
            <code className="text-xl font-mono text-brand-300 font-bold">
              {recommendedCommand.name}
            </code>
          </div>
          <p className="text-white/80 mb-4">{recommendedCommand.description}</p>
          <div className="flex flex-wrap gap-2">
            {recommendedCommand.keywords.slice(0, 5).map((kw) => (
              <span key={kw} className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/60">
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Bắt đầu lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-brand-400" />
        Tìm Command phù hợp
      </h2>

      {/* Breadcrumbs */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <button
            onClick={handleBack}
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Quay lại
          </button>
          {history.map((h, i) => (
            <React.Fragment key={i}>
              <span className="text-white/30">/</span>
              <span className="text-white/50">{h.answer}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {currentNode && (
        <>
          <h3 className="text-lg text-white mb-4">{currentNode.question}</h3>
          <div className="space-y-2">
            {currentNode.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-400/30 transition-all group text-left"
              >
                <div>
                  <span className="text-white font-medium">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-white/50 mt-1">{option.description}</p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-brand-400 transition-colors" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DecisionTreeWithRecommendations;
