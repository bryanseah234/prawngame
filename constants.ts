
import { Question } from './types';
import rawQuestions from 'questions.json';

// Handle potential default export wrapping by bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = (rawQuestions as any).default || rawQuestions;

// Cast the imported JSON to the Question type. 
export const QUESTIONS: Question[] = data as Question[];
