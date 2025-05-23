import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { DatePicker } from './ui/date-picker';

interface SearchBarProps {
  onSearch: (params: {
    search: string;
    sortBy: string;
    sortOrder: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  type: 'posts' | 'users';
}

export function SearchBar({ onSearch, type }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState<string>();
  const [dateTo, setDateTo] = useState<string>();

  const handleSearch = () => {
    onSearch({
      search,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex gap-2">
        <Input
          placeholder={`Search ${type}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="flex gap-4">
        <Select
          value={sortBy}
          onValueChange={setSortBy}
        >
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          {type === 'posts' && (
            <>
              <option value="title">Title</option>
              <option value="publishedAt">Published At</option>
            </>
          )}
          {type === 'users' && (
            <>
              <option value="username">Username</option>
              <option value="email">Email</option>
            </>
          )}
        </Select>

        <Select
          value={sortOrder}
          onValueChange={setSortOrder}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>

        {type === 'posts' && (
          <>
            <DatePicker
              placeholder="From date"
              value={dateFrom}
              onChange={setDateFrom}
            />
            <DatePicker
              placeholder="To date"
              value={dateTo}
              onChange={setDateTo}
            />
          </>
        )}
      </div>
    </div>
  );
} 