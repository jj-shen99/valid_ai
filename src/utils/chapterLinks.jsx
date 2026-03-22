export const CHAPTER_LINKS = {
  'Ch 2': {
    title: 'Chapter 2: The Hallucination Problem',
    url: '#chapter-2',
    description: 'AI models hallucinate APIs and functions that don\'t exist',
  },
  'Ch 3': {
    title: 'Chapter 3: The Bug Zoo',
    url: '#chapter-3',
    description: 'Common AI-generated bugs: off-by-one errors, semantic drift, exception swallowing',
  },
  'Ch 4': {
    title: 'Chapter 4: The Oracle Problem',
    url: '#chapter-4',
    description: 'How to specify what correct behavior looks like',
  },
  'Ch 5': {
    title: 'Chapter 5: Risk-Based Testing Strategy',
    url: '#chapter-5',
    description: 'Prioritizing which tests to run first',
  },
  'Ch 6': {
    title: 'Chapter 6: Prompt Engineering for Testability',
    url: '#chapter-6',
    description: 'Writing prompts that generate testable code',
  },
  'Ch 7': {
    title: 'Chapter 7: Property-Based Testing',
    url: '#chapter-7',
    description: 'Generating tests from function signatures and properties',
  },
  'Ch 8': {
    title: 'Chapter 8: Differential Testing',
    url: '#chapter-8',
    description: 'Comparing two implementations for correctness',
  },
  'Ch 9': {
    title: 'Chapter 9: Performance and Complexity',
    url: '#chapter-9',
    description: 'Detecting algorithmic complexity issues',
  },
  'Ch 10': {
    title: 'Chapter 10: Mutation Testing',
    url: '#chapter-10',
    description: 'Evaluating test suite quality',
  },
  'Ch 11': {
    title: 'Chapter 11: The Robot Code Reviewer',
    url: '#chapter-11',
    description: 'Using AI to review AI-generated code',
  },
  'Ch 13': {
    title: 'Chapter 13: Security Testing',
    url: '#chapter-13',
    description: 'Finding security vulnerabilities in AI code',
  },
}

export const getChapterInfo = (chapterRef) => {
  return CHAPTER_LINKS[chapterRef] || {
    title: 'Testing the Machine',
    url: '#',
    description: 'See the book for more information',
  }
}

export const ChapterLink = ({ chapter, children }) => {
  const info = getChapterInfo(chapter)
  return (
    <a
      href={info.url}
      title={info.description}
      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
    >
      {children || chapter}
    </a>
  )
}
