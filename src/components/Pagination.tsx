import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages === 0) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '8px', 
      marginTop: '24px',
      padding: '16px 0'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0',
          background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          color: currentPage === 1 ? '#cbd5e1' : '#0f172a', opacity: isLoading ? 0.5 : 1
        }}
      >
        <ChevronLeft size={18} />
      </button>

      {getPages().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          style={{
            width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0',
            background: currentPage === page ? '#0A1E28' : 'white',
            color: currentPage === page ? '#C8F032' : '#0f172a',
            fontWeight: '800', cursor: 'pointer', opacity: isLoading ? 0.5 : 1,
            transition: 'all 0.2s',
            boxShadow: currentPage === page ? '0 4px 12px rgba(10, 30, 40, 0.2)' : 'none'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0',
          background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          color: currentPage === totalPages ? '#cbd5e1' : '#0f172a', opacity: isLoading ? 0.5 : 1
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;