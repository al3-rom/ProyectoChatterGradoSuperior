import { useState } from "react";

/**
 * hook para anadir tags/idiomas pulsando Enter o coma
 * @param {string[]} initialTags - array inicial
 */
export function useTagInput(initialTags = []) {
    const [tags, setTags] = useState(initialTags);
    const [inputValue, setInputValue] = useState("");

    const addTag = (tag) => {
        const clean = tag.trim();
        if (clean && !tags.includes(clean)) {
            setTags(prev => [...prev, clean]);
        }
    };

    const removeTag = (tag) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue.replace(",", ""));
            setInputValue("");
        }
    };

    return {
        tags,
        inputValue,
        setTags,
        setInputValue,
        removeTag,
        handleInputChange,
        handleInputKeyDown,
    };
}
