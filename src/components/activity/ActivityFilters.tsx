import { useState } from 'react';
import { Calendar, User } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useUserStore } from '../../stores/userStore';

interface ActivityFiltersProps {
  onFilter: (filters: { date?: string; userId?: string }) => void;
  onClear: () => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({ onFilter, onClear }) => {
  const { users } = useUserStore();
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ date, userId });
  };

  const handleClear = () => {
    setDate('');
    setUserId('');
    onClear();
  };

  const userOptions = [
    { value: '', label: 'Todos los usuarios' },
    ...users.map(user => ({
      value: user.id,
      label: user.username
    }))
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          leftAdornment={<Calendar className="h-5 w-5 text-gray-400" />}
        />

        <Select
          options={userOptions}
          value={userId}
          onChange={setUserId}
          leftAdornment={<User className="h-5 w-5 text-gray-400" />}
        />
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
        >
          Limpiar
        </Button>
        <Button type="submit">
          Filtrar
        </Button>
      </div>
    </form>
  );
};

export default ActivityFilters;