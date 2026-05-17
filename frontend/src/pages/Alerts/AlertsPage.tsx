import { useNavigate } from 'react-router-dom';
import { Panel, PanelBody, PanelHeader } from '@/components/ui/panel';
import { AlertList } from './components/AlertList';
import type { AlertAction, AlertItem } from './alertUtils';

interface AlertsPageProps {
  alerts: AlertItem[];
  spaceId: string;
  onAlertReadChange?: (alertId: string, read: boolean) => void;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, spaceId, onAlertReadChange }) => {
  const navigate = useNavigate();

  const handleAction = (action: AlertAction) => {
    navigate({
      pathname: `/space/${spaceId}${action.path}`,
      search: action.search?.startsWith('?') ? action.search : action.search && `?${action.search}`,
    });
  };

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Alerts & Insights</div>
            <div className="text-[11px] text-text2">
              Real-time notifications from your trading data
            </div>
          </div>
        </PanelHeader>
        <PanelBody>
          <AlertList alerts={alerts} onAction={handleAction} onReadChange={onAlertReadChange} />
        </PanelBody>
      </Panel>
    </div>
  );
};

export default AlertsPage;
