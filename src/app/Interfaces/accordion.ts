export interface AccordionItem{
    id: string;
    title: string;
    content: AccordionContentBlock[];
}

export interface AccordionContentBlock{
    optionalText: string;
    value: string;
    url: string;
}