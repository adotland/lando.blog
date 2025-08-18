import dynamic from 'next/dynamic';

const TableOfContents = dynamic(() => import('./TableOfContentsComp'), {
  ssr: false
});

export default TableOfContents;
