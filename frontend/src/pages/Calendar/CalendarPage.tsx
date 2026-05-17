import CalendarView from './components/CalendarView';
import type { Trade } from '@/types/trade';

interface CalendarPageProps {
  trades: Trade[];
  spaceId: string;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ trades, spaceId }) => {
  return <CalendarView trades={trades} spaceId={spaceId} />;
};

export default CalendarPage;
