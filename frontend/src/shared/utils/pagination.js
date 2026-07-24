export const ELLIPSIS = '...';

export function buildPageRange(currentPage, totalPages, siblingCount = 1) {
    if (!totalPages || totalPages <= 0) return [];

    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) {
        return Array.from({length: totalPages}, (_, i) => i);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 0);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

    const showLeftEllipsis = leftSibling > 1;
    const showRightEllipsis = rightSibling < totalPages - 2;

    const range = [0];

    if (showLeftEllipsis) {
        range.push(ELLIPSIS);
    } else {
        for (let i = 1; i < leftSibling; i++) range.push(i);
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 0 && i !== totalPages - 1) range.push(i);
    }

    if (showRightEllipsis) {
        range.push(ELLIPSIS);
    } else {
        for (let i = rightSibling + 1; i < totalPages - 1; i++) range.push(i);
    }

    range.push(totalPages - 1);

    return range;
}
