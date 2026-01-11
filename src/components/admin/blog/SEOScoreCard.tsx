"use client";

import React, { useMemo } from 'react';
import {
    Target, AlertCircle, CheckCircle, Info, TrendingUp,
    FileText, Hash, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { analyzeSEO, SEOAnalysis } from '@/lib/utils/seoUtils';

interface SEOScoreCardProps {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    tags: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
    images: Array<{ url?: string; alt?: string }>;
}

export const SEOScoreCard: React.FC<SEOScoreCardProps> = (props) => {
 const analysis: SEOAnalysis = useMemo(() => {
 return analyzeSEO({
 title: props.title,
 slug: props.slug,
 excerpt: props.excerpt,
 content: props.content,
 seoTitle: props.seoTitle,
 seoDescription: props.seoDescription,
 tags: props.tags.map(t => t.name),
 categories: props.categories.map(c => c.name),
 images: props.images
 });
 }, [props]);

 const getScoreColor = (score: number) => {
 if (score >= 80) return 'text-green-600';
 if (score >= 60) return 'text-yellow-600';
 return 'text-red-600';
 };

 const getScoreBgColor = (score: number) => {
 if (score >= 80) return 'bg-green-100';
 if (score >= 60) return 'bg-yellow-100';
 return 'bg-red-100';
 };

 const getScoreLabel = (score: number) => {
 if (score >= 90) return 'Excellent';
 if (score >= 80) return 'Good';
 if (score >= 60) return 'Needs Work';
 return 'Poor';
 };

 const getIcon = (type: 'error' | 'warning' | 'info') => {
 switch (type) {
 case 'error':
 return <AlertCircle className="h-4 w-4 text-red-500" />;
 case 'warning':
 return <Info className="h-4 w-4 text-yellow-500" />;
 case 'info':
 return <CheckCircle className="h-4 w-4 text-green-500" />;
 }
 };

 const groupedIssues = useMemo(() => {
 const groups: Record<string, typeof analysis.issues> = {};
 analysis.issues.forEach(issue => {
 if (!groups[issue.category]) {
 groups[issue.category] = [];
 }
 groups[issue.category].push(issue);
 });
 return groups;
 }, [analysis.issues]);

 const getCategoryIcon = (category: string) => {
 switch (category.toLowerCase()) {
 case 'title':
 case 'meta':
 return <FileText className="h-4 w-4" />;
 case 'slug':
 return <LinkIcon className="h-4 w-4" />;
 case 'images':
 return <ImageIcon className="h-4 w-4" />;
 case 'taxonomy':
 return <Hash className="h-4 w-4" />;
 default:
 return <Target className="h-4 w-4" />;
 }
 };

 return (
 <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg">
 {/* Header with Score */}
 <div className="p-6 border-b border-gray-200 ">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`p-3 rounded-full ${getScoreBgColor(analysis.score)}`}>
 <TrendingUp className={`h-6 w-6 ${getScoreColor(analysis.score)}`} />
 </div>
 <div>
 <h3 className="text-lg font-bold text-gray-900 ">
 SEO Score
 </h3>
 <p className="text-sm text-gray-500 ">
 Real-time analysis
 </p>
 </div>
 </div>

 <div className="text-right">
 <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
 {analysis.score}
 </div>
 <div className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
 {getScoreLabel(analysis.score)}
 </div>
 </div>
 </div>

 {/* Score Bar */}
 <div className="mt-4">
 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
 <div
 className={`h-full transition-all duration-500 ${
 analysis.score >= 80
 ? 'bg-green-500'
 : analysis.score >= 60
 ? 'bg-yellow-500'
 : 'bg-red-500'
 }`}
 style={{ width: `${analysis.score}%` }}
 />
 </div>
 </div>
 </div>

 {/* Issues by Category */}
 <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
 {Object.entries(groupedIssues).map(([category, issues]) => (
 <div key={category} className="space-y-2">
 <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 ">
 {getCategoryIcon(category)}
 {category}
 </div>
 <div className="space-y-1 ml-6">
 {issues.map((issue, idx) => (
 <div key={idx} className="flex items-start gap-2 text-sm">
 {getIcon(issue.type)}
 <span className={`flex-1 ${
 issue.type === 'error' ? 'text-red-700' :
 issue.type === 'warning' ? 'text-yellow-700' :
 'text-gray-600'
 }`}>
 {issue.message}
 </span>
 </div>
 ))}
 </div>
 </div>
 ))}

 {/* Recommendations */}
 {analysis.recommendations.length > 0 && (
 <div className="space-y-2 pt-4 border-t border-gray-200 ">
 <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 ">
 <Target className="h-4 w-4" />
 Recommendations
 </div>
 <ul className="space-y-1 ml-6 list-disc list-inside text-sm text-gray-600 ">
 {analysis.recommendations.map((rec, idx) => (
 <li key={idx}>{rec}</li>
 ))}
 </ul>
 </div>
 )}
 </div>

 {/* Quick Stats Footer */}
 <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
 <div className="grid grid-cols-3 gap-4 text-center">
 <div>
 <div className="text-2xl font-bold text-gray-900 ">
 {analysis.issues.filter(i => i.type === 'error').length}
 </div>
 <div className="text-xs text-gray-500 ">Errors</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-gray-900 ">
 {analysis.issues.filter(i => i.type === 'warning').length}
 </div>
 <div className="text-xs text-gray-500 ">Warnings</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-gray-900 ">
 {analysis.issues.filter(i => i.type === 'info').length}
 </div>
 <div className="text-xs text-gray-500 ">Passed</div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default SEOScoreCard;
