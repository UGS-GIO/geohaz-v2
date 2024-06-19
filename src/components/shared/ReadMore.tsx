import { CalciteLink } from '@esri/calcite-components-react';
import { useState } from 'react';

interface Paragraph {
    text: string;
    bold: boolean;
}

interface ReadMoreProps {
    id: string;
    paragraphs: Paragraph[];
    amountOfWords?: number;
}

export const ReadMore = ({ id, paragraphs, amountOfWords = 36 }: ReadMoreProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const splitText = (paragraphs: Paragraph[], limit: number) => {
        let wordCount = 0;
        let initialParagraphs: Paragraph[] = [];
        let remainingParagraphs: Paragraph[] = [];

        for (let paragraph of paragraphs) {
            const words = paragraph.text.split(' ');
            if (wordCount + words.length <= limit) {
                initialParagraphs.push(paragraph);
                wordCount += words.length;
            } else {
                const initialWords = words.slice(0, limit - wordCount).join(' ');
                const remainingWords = words.slice(limit - wordCount).join(' ');
                initialParagraphs.push({ text: initialWords, bold: paragraph.bold });
                remainingParagraphs = [{ text: remainingWords, bold: paragraph.bold }, ...paragraphs.slice(paragraphs.indexOf(paragraph) + 1)];
                break;
            }
        }

        return { initialParagraphs, remainingParagraphs };
    }

    const { initialParagraphs, remainingParagraphs } = splitText(paragraphs, amountOfWords);


    const handleKeyboard = (e: React.KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            setIsExpanded(!isExpanded);
        }
    }

    const renderTextWithLinksAndStyles = (text: string, bold: boolean) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            const renderedPart = urlRegex.test(part) ? (
                <CalciteLink key={index} href={part} target="_blank" rel="noopener noreferrer">
                    {part}
                </CalciteLink>
            ) : (
                part
            );
            return (
                <span key={index}>
                    {bold ? <b>{renderedPart}</b> : renderedPart}{' '}
                </span>
            );
        });
    };

    return (
        <div id={id}>
            <div>
                {!isExpanded && (
                    <>
                        {initialParagraphs.map((para, index) => (
                            <p key={index} className="mb-2">{renderTextWithLinksAndStyles(para.text, para.bold)}</p>
                        ))}
                    </>
                )}

                {remainingParagraphs.length > 0 && (
                    <>
                        {!isExpanded && <span>... </span>}
                        {isExpanded && (
                            <>
                                {isExpanded && (
                                    <p className="mb-2">
                                        {renderTextWithLinksAndStyles(`${initialParagraphs[initialParagraphs.length - 1].text} ${remainingParagraphs[0].text}`, initialParagraphs[initialParagraphs.length - 1].bold)}
                                    </p>
                                )}
                                {remainingParagraphs.slice(1).map((para, index) => (
                                    <p key={index} className="mb-2">{renderTextWithLinksAndStyles(para.text, para.bold)}</p>
                                ))}
                            </>
                        )}
                        <span
                            className='text-violet-400 ml-2'
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            aria-controls={id}
                            onKeyDown={handleKeyboard}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'show less' : 'show more'}
                        </span>
                    </>
                )}
            </div>
        </div>
    )
}
