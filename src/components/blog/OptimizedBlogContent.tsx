"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';

interface OptimizedBlogContentProps {
  content: string;
  className?: string;
}

/**
 * OptimizedBlogContent - Renders blog HTML content with optimized images
 *
 * Features:
 * - Converts img tags to Next.js Image components for optimization
 * - Lazy loads images below the fold
 * - Preserves figure/figcaption structure
 * - Maintains accessibility with alt text
 * - Responsive image sizing
 */
export const OptimizedBlogContent: React.FC<OptimizedBlogContentProps> = ({
  content,
  className = ''
}) => {
  const parsedContent = useMemo(() => {
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        // Type guard for Element nodes
        if (domNode.type !== 'tag') return;

        const element = domNode as Element;

        // Handle img tags
        if (element.name === 'img') {
          const src = element.attribs?.src || '';
          const alt = element.attribs?.alt || 'Blog image';
          const style = element.attribs?.style || '';

          // Skip data URLs (shouldn't happen if ContentImageManager is used properly)
          if (src.startsWith('data:')) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-xl my-6 mx-auto block shadow-md"
                loading="lazy"
              />
            );
          }

          // Check if this is an external image or from our server
          const isExternal = src.startsWith('http') && !src.includes('13.61.8.56');

          if (isExternal) {
            // For external images, use regular img with loading lazy
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-xl my-6 mx-auto block shadow-md"
                loading="lazy"
              />
            );
          }

          // For our server images, use Next.js Image with optimization
          return (
            <span className="block my-6 relative">
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={675}
                className="max-w-full h-auto rounded-xl mx-auto block shadow-md object-contain"
                loading="lazy"
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '600px'
                }}
              />
            </span>
          );
        }

        // Handle figure elements with images
        if (element.name === 'figure') {
          const children = element.children as DOMNode[];
          let imgSrc = '';
          let imgAlt = 'Blog image';
          let captionText = '';

          // Extract image and caption from figure
          children?.forEach((child) => {
            if ((child as Element).name === 'img') {
              const imgEl = child as Element;
              imgSrc = imgEl.attribs?.src || '';
              imgAlt = imgEl.attribs?.alt || 'Blog image';
            }
            if ((child as Element).name === 'figcaption') {
              const figcaptionEl = child as Element;
              // Get text content from figcaption
              captionText = getTextContent(figcaptionEl);
            }
          });

          if (!imgSrc) return;

          const isExternal = imgSrc.startsWith('http') && !imgSrc.includes('13.61.8.56');

          return (
            <figure className="my-8 text-center">
              {isExternal ? (
                <img
                  src={imgSrc}
                  alt={imgAlt}
                  className="max-w-full h-auto rounded-xl mx-auto block shadow-md"
                  loading="lazy"
                />
              ) : (
                <Image
                  src={imgSrc}
                  alt={imgAlt}
                  width={1200}
                  height={675}
                  className="max-w-full h-auto rounded-xl mx-auto block shadow-md object-contain"
                  loading="lazy"
                  quality={85}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '600px'
                  }}
                />
              )}
              {captionText && (
                <figcaption className="text-sm text-gray-500 mt-3 italic">
                  {captionText}
                </figcaption>
              )}
            </figure>
          );
        }

        // For all other elements, use default rendering
        return;
      }
    };

    return parse(content || '', options);
  }, [content]);

  return (
    <div className={className}>
      {parsedContent}
    </div>
  );
};

// Helper function to extract text content from an element
function getTextContent(element: Element): string {
  let text = '';

  const traverse = (node: any) => {
    if (node.type === 'text') {
      text += node.data || '';
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  if (element.children) {
    element.children.forEach(traverse);
  }

  return text.trim();
}

export default OptimizedBlogContent;
