import React, { useState } from "react";

type Props = {
  categories: string[];
  tags: string[];
  onCategoriesChange: (c: string[]) => void;
  onTagsChange: (t: string[]) => void;
  suggestions?: { categories?: string[]; tags?: string[] };
};

export const CategoryTagManager: React.FC<Props> = ({
  categories,
  tags,
  onCategoriesChange,
  onTagsChange,
  suggestions = { categories: [], tags: [] },
}) => {
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  function addCategory() {
    const v = categoryInput.trim();
    if (!v || categories.includes(v)) return;
    onCategoriesChange([...categories, v]);
    setCategoryInput("");
  }
  function removeCategory(index: number) {
    const copy = [...categories];
    copy.splice(index, 1);
    onCategoriesChange(copy);
  }

  function addTag() {
    const v = tagInput.trim();
    if (!v || tags.includes(v)) return;
    onTagsChange([...tags, v]);
    setTagInput("");
  }
  function removeTag(index: number) {
    const copy = [...tags];
    copy.splice(index, 1);
    onTagsChange(copy);
  }

  // lightweight reorder by moving item up/down
  function moveCategory(idx: number, dir: -1 | 1) {
    const copy = [...categories];
    const to = idx + dir;
    if (to < 0 || to >= copy.length) return;
    [copy[idx], copy[to]] = [copy[to], copy[idx]];
    onCategoriesChange(copy);
  }

  return (
    <div className="category-tag-manager">
      <fieldset>
        <legend>Categories</legend>
        <div className="chips" aria-live="polite">
          {categories.map((c, i) => (
            <span key={c} className="chip">
              {c}
              <button aria-label={`move up ${c}`} onClick={() => moveCategory(i, -1)}>↑</button>
              <button aria-label={`move down ${c}`} onClick={() => moveCategory(i, 1)}>↓</button>
              <button aria-label={`remove ${c}`} onClick={() => removeCategory(i)}>×</button>
            </span>
          ))}
        </div>
        <div className="input-row">
          <input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
            placeholder="Add or choose category"
            aria-autocomplete="list"
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {suggestions.categories?.map((s) => <option key={s} value={s} />)}
          </datalist>
          <button type="button" onClick={addCategory}>Add</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>Tags</legend>
        <div className="chips" aria-live="polite">
          {tags.map((t, i) => (
            <span key={t} className="chip">
              {t}
              <button aria-label={`remove ${t}`} onClick={() => removeTag(i)}>×</button>
            </span>
          ))}
        </div>
        <div className="input-row">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag and press Enter"
            aria-autocomplete="list"
            list="tag-suggestions"
          />
          <datalist id="tag-suggestions">
            {suggestions.tags?.map((s) => <option key={s} value={s} />)}
          </datalist>
          <button type="button" onClick={addTag}>Add</button>
        </div>
      </fieldset>
    </div>
  );
};