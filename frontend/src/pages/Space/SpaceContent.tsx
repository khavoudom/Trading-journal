import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navigate, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ErrorPage from '@/pages/Error/ErrorPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTradeStore } from '@/store/tradeStore';
import { useAuthStore } from '@/store/authStore';
import { tradeService } from '@/services/tradeService';
import { notificationService } from '@/services/notificationService';
import { useRiskRuleStore } from '@/store/riskRuleStore';
import { buildAlertItems } from '@/pages/Alerts/alertUtils';
import {
  DashboardPageLoader,
  PortfolioPageLoader,
  CalendarPageLoader,
  AnalyticsPageLoader,
  AlertsPageLoader,
  RiskManagerPageLoader,
  DrawingBoardPageLoader,
  WatchlistPageLoader,
  BacktestPageLoader,
  SchedulePageLoader,
  TradePlanPageLoader,
  SettingsPageLoader,
  NotFoundPageLoader,
} from '@/components/loaders';
import type {
  Trade,
  TradeFormValues,
  AnalyticsSummary,
  TemplateTradeAttachment,
} from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';

const AnalyticsPage = lazy(() => import('@/pages/Analytics/AnalyticsPage'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
const PortfolioPage = lazy(() => import('@/pages/Portfolio/PortfolioPage'));
const CalendarPage = lazy(() => import('@/pages/Calendar/CalendarPage'));
const AlertsPage = lazy(() => import('@/pages/Alerts/AlertsPage'));
const RiskManagerPage = lazy(() => import('@/pages/RiskManager/RiskManagerPage'));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));
const TradePlanPage = lazy(() => import('@/pages/TradePlan/TradePlanPage'));
const WatchlistPage = lazy(() => import('@/pages/Watchlist/WatchlistPage'));
const BacktestPage = lazy(() => import('@/pages/Backtest/BacktestPage'));
const SchedulePage = lazy(() => import('@/pages/Schedule/SchedulePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));
const DrawingBoardPage = lazy(() => import('@/pages/DrawingBoard/DrawingBoardPage'));
const TradeModal = lazy(() =>
  import('@/components/shared/TradeModal').then(({ TradeModal }) => ({ default: TradeModal })),
);

const getShowAlertsStorageKey = (spaceId: string) => `showAlertsPage:${spaceId}`;
const getReadAlertsStorageKey = (spaceId: string) => `readAlertIds:${spaceId}`;
const readShowAlertsPage = (spaceId: string) => {
  const stored = localStorage.getItem(getShowAlertsStorageKey(spaceId));
  return stored === null ? true : stored === 'true';
};
const readStoredAlertIds = (spaceId: string) => {
  const stored = localStorage.getItem(getReadAlertsStorageKey(spaceId));
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export default function SpaceContent({ spaceId }: { spaceId: string }) {
  const {
    trades,
    loading: tradesLoading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    fetchTrades,
  } = useTradeStore();
  const { user } = useAuthStore();
  const { rules, fetchRules } = useRiskRuleStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [alertsPageVisibility, setAlertsPageVisibility] = useState<Record<string, boolean>>(() => ({
    [spaceId]: readShowAlertsPage(spaceId),
  }));
  const [readAlertIdsBySpace, setReadAlertIdsBySpace] = useState<Record<string, string[]>>(() => ({
    [spaceId]: readStoredAlertIds(spaceId),
  }));
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const showAlertsPage = alertsPageVisibility[spaceId] ?? readShowAlertsPage(spaceId);
  const readAlertIds = readAlertIdsBySpace[spaceId] ?? readStoredAlertIds(spaceId);

  const showNewTrade = searchParams.has('newTrade');
  const editTradeId = searchParams.get('editTrade') || null;
  const editTrade: Trade | undefined = editTradeId
    ? trades.find((t) => t.id === editTradeId)
    : undefined;
  const newTradePrefillDate = searchParams.get('date') || undefined;

  const closeModal = () => {
    navigate(location.pathname, { replace: true });
  };

  useEffect(() => {
    if (user && spaceId) {
      fetchTrades(spaceId);
    }
  }, [user, spaceId, fetchTrades]);

  useEffect(() => {
    if (user && spaceId) {
      fetchRules(spaceId);
    }
  }, [user, spaceId, fetchRules]);

  useEffect(() => {
    if (!user || !spaceId) return;
    notificationService.getAlertReads(spaceId).then((ids) => {
      setReadAlertIdsBySpace((prev) => ({ ...prev, [spaceId]: ids }));
    });
  }, [user, spaceId]);

  useEffect(() => {
    const ids = readAlertIdsBySpace[spaceId];
    if (!ids) return;
    notificationService.setAlertRead(spaceId, ids);
  }, [readAlertIdsBySpace, spaceId]);

  const portfolioData = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status !== 'pending' && t.status !== 'running');
    if (closedTrades.length === 0) return [];
    const sortedTrades = [...closedTrades].sort(
      (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
    );
    let cumulativePL = 0;
    const initialBalance = 10000;
    return sortedTrades.map((trade) => {
      cumulativePL += trade.profitLoss;
      return {
        date: new Date(trade.exitTime).toLocaleDateString(),
        value: initialBalance + cumulativePL,
        profitLoss: trade.profitLoss,
      };
    });
  }, [trades]);

  const fetchAnalytics = async () => {
    if (!user || !spaceId) return;
    try {
      setAnalyticsLoading(true);
      const data = await tradeService.getAnalyticsSummary(spaceId);
      setAnalytics(data);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const disciplineScore = useMemo(() => {
    if (trades.length === 0) return 0;
    const scores: number[] = [];
    for (const trade of trades) {
      if (trade.status === 'pending' || trade.status === 'running') continue;
      const planData = trade.planData as TemplateTradeAttachment[] | undefined;
      if (!planData || planData.length === 0) continue;
      const allCheckboxes = planData.flatMap((a) => a.items.filter((i) => i.type === 'checkbox'));
      if (allCheckboxes.length === 0) continue;
      const checked = allCheckboxes.filter((i) => i.checked).length;
      scores.push(Math.round((checked / allCheckboxes.length) * 100));
    }
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [trades]);

  const alertItems = useMemo(() => {
    const readIds = new Set(readAlertIds);
    return buildAlertItems(trades, rules).map((alert) => ({
      ...alert,
      read: readIds.has(alert.id),
    }));
  }, [readAlertIds, rules, trades]);
  const unreadAlertCount = alertItems.filter((alert) => !alert.read).length;

  const setupScore = useMemo(() => {
    if (trades.length === 0) return 0;
    const scores: number[] = [];
    for (const trade of trades) {
      if (trade.status === 'pending' || trade.status === 'running') continue;
      const setupData = trade.setupData as TemplateTradeAttachment[] | undefined;
      if (!setupData || setupData.length === 0) continue;
      const allCheckboxes = setupData.flatMap((a) => a.items.filter((i) => i.type === 'checkbox'));
      if (allCheckboxes.length === 0) continue;
      const checked = allCheckboxes.filter((i) => i.checked).length;
      scores.push(Math.round((checked / allCheckboxes.length) * 100));
    }
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [trades]);

  useEffect(() => {
    fetchAnalytics();
  }, [trades, user, spaceId]);

  const isLoading = tradesLoading || analyticsLoading;

  const currentPortfolioValue =
    portfolioData.length > 0 ? portfolioData[portfolioData.length - 1].value : 10000;

  const previousPortfolioValue =
    portfolioData.length > 1 ? portfolioData[portfolioData.length - 2].value : 10000;

  const portfolioChange =
    previousPortfolioValue !== 0
      ? ((currentPortfolioValue - previousPortfolioValue) / previousPortfolioValue) * 100
      : 0;

  const handleCreateTrade = async (data: TradeFormValues) => {
    await addTrade({ ...data, spaceId });
    closeModal();
    fetchAnalytics();
  };

  const handleUpdateTrade = async (id: string, data: TradeFormValues) => {
    await updateTrade(id, data);
    closeModal();
    fetchAnalytics();
  };

  const handleDeleteTrade = async (id: string) => {
    if (window.confirm('Delete this trade?')) {
      await deleteTrade(id, spaceId);
      closeModal();
      fetchAnalytics();
    }
  };

  const setShowAlertsPage = (value: boolean) => {
    setAlertsPageVisibility((prev) => ({ ...prev, [spaceId]: value }));
    localStorage.setItem(getShowAlertsStorageKey(spaceId), String(value));
  };

  const setAlertRead = (alertId: string, read: boolean) => {
    setReadAlertIdsBySpace((prev) => {
      const current = new Set(prev[spaceId] ?? readStoredAlertIds(spaceId));
      if (read) current.add(alertId);
      else current.delete(alertId);

      const nextIds = Array.from(current);
      localStorage.setItem(getReadAlertsStorageKey(spaceId), JSON.stringify(nextIds));
      return { ...prev, [spaceId]: nextIds };
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <ErrorPage
          title="Connection Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <DashboardLayout
                spaceId={spaceId}
                alertCount={unreadAlertCount}
                alerts={alertItems}
                onAlertReadChange={setAlertRead}
                showAlertsPage={showAlertsPage}
              />
            }
          >
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<DashboardPageLoader />}>
                  <DashboardPage
                    trades={trades}
                    spaceId={spaceId}
                    analytics={analytics}
                    isLoading={isLoading}
                    portfolioData={portfolioData}
                    portfolioChange={portfolioChange}
                  />
                </Suspense>
              }
            />
            <Route
              path="portfolio"
              element={
                <Suspense fallback={<PortfolioPageLoader />}>
                  <PortfolioPage
                    trades={trades}
                    isLoading={isLoading}
                    onDelete={handleDeleteTrade}
                  />
                </Suspense>
              }
            />
            <Route
              path="calendar"
              element={
                <Suspense fallback={<CalendarPageLoader />}>
                  <CalendarPage trades={trades} spaceId={spaceId} />
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<AnalyticsPageLoader />}>
                  <AnalyticsPage
                    portfolioData={portfolioData}
                    trades={trades}
                    analytics={analytics}
                    disciplineScore={disciplineScore}
                    setupScore={setupScore}
                  />
                </Suspense>
              }
            />
            <Route
              path="alerts"
              element={
                <Suspense fallback={<AlertsPageLoader />}>
                  {showAlertsPage ? (
                    <AlertsPage
                      alerts={alertItems}
                      spaceId={spaceId}
                      onAlertReadChange={setAlertRead}
                    />
                  ) : (
                    <Navigate to={`/space/${spaceId}/dashboard`} replace />
                  )}
                </Suspense>
              }
            />
            <Route
              path="risk-manager"
              element={
                <Suspense fallback={<RiskManagerPageLoader />}>
                  <RiskManagerPage spaceId={spaceId} />
                </Suspense>
              }
            />
            <Route
              path="drawing-board"
              element={
                <Suspense fallback={<DrawingBoardPageLoader />}>
                  <DrawingBoardPage spaceId={spaceId} />
                </Suspense>
              }
            />
            <Route
              path="watchlist"
              element={
                <Suspense fallback={<WatchlistPageLoader />}>
                  <WatchlistPage />
                </Suspense>
              }
            />
            <Route
              path="backtest"
              element={
                <Suspense fallback={<BacktestPageLoader />}>
                  <BacktestPage />
                </Suspense>
              }
            />
            <Route
              path="schedule"
              element={
                <Suspense fallback={<SchedulePageLoader />}>
                  <SchedulePage trades={trades} spaceId={spaceId} />
                </Suspense>
              }
            />
            <Route
              path="trade-plan"
              element={
                <Suspense fallback={<TradePlanPageLoader />}>
                  <TradePlanPage spaceId={spaceId} />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<SettingsPageLoader />}>
                  <SettingsPage
                    showAlertsPage={showAlertsPage}
                    onShowAlertsPageChange={setShowAlertsPage}
                  />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<NotFoundPageLoader />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>

      {showNewTrade && (
        <Suspense fallback={null}>
          <TradeModal
            title="New Trade"
            prefillDate={newTradePrefillDate}
            spaceId={spaceId}
            onSubmit={handleCreateTrade}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {editTrade && (
        <Suspense fallback={null}>
          <TradeModal
            title={`Edit ${INSTRUMENT_LABELS[editTrade.instrument] || editTrade.instrument} Trade`}
            initialData={editTrade}
            spaceId={spaceId}
            onSubmit={(data) => handleUpdateTrade(editTrade.id, data)}
            onDelete={() => handleDeleteTrade(editTrade.id)}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {editTradeId && !editTrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="card p-6 w-full max-w-sm mx-4 animate-fade-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-(--text-gray-500) mb-4">Trade not found</p>
            <button
              onClick={closeModal}
              className="h-9 px-4 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
