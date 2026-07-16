import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';

export default function BookCard({ book, onDelete }) {
  return (
    <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            book.status === 'Available' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {book.status}
          </span>
          <Bookmark className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-slate-400 mt-1">by {book.author}</p>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-500">
          <span>ISBN: {book.isbn}</span>
          <span>Genre: {book.genre}</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => onDelete(book.id)}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}