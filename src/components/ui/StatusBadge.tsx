import { useMemo } from 'react';
import { GiftcardStatus } from '../../types';
import Badge from './Badge';
import { translateStatus } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: GiftcardStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { i18n } = useTranslation();

  const variant = useMemo(() => {
    switch (status) {
      case 'created_not_delivered':
        return 'primary';
      case 'delivered':
        return 'secondary';
      case 'redeemed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  }, [status]);

  return (
    <Badge variant={variant} className={className}>
      {translateStatus(status, i18n.language)}
    </Badge>
  );
};

export default StatusBadge;