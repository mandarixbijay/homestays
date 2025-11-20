"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { List, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const headingElements = tempDiv.querySelectorAll("h2, h3");
    const items: TOCItem[] = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1));
      return { id, text, level };
    });

    setHeadings(items);

    // Add IDs to actual heading elements in the DOM
    const actualHeadings = document.querySelectorAll(".prose h2, .prose h3");
    actualHeadings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );

    actualHeadings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      actualHeadings.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <Card className="p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-5 w-5 text-[#214B3F]" />
        <h3 className="font-bold text-gray-900">Table of Contents</h3>
      </div>
      <nav>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <motion.li
              key={heading.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`${heading.level === 3 ? "ml-4" : ""}`}
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  text-left w-full py-1.5 px-3 rounded-lg transition-all duration-200
                  hover:bg-[#214B3F]/10 hover:text-[#214B3F] flex items-start gap-2
                  ${
                    activeId === heading.id
                      ? "bg-[#214B3F]/10 text-[#214B3F] font-medium"
                      : "text-gray-600"
                  }
                `}
              >
                {activeId === heading.id && (
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span className={activeId === heading.id ? "" : "ml-6"}>
                  {heading.text}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}
