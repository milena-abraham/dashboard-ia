'use client';

import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import KPICards from '@/components/KPICards';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import { useDashboardState } from '@/features/dashboard/useDashboardState';
import {
  DashboardHeader,
  DashboardUploader,
  ExecutiveSummary,
  ExploratoryCharts,
  ForecastSection,
  SegmentationSection,
  AnomaliesSection,
  FeatureImportanceSection,
  DashboardChat,
} from '@/features/dashboard/components';

function DashboardInner() {
  const {
    loading,
    result,
    filesQueue,
    currentFileIndex,
    isUploading,
    uploadProgress,
    targetCol,
    setTargetCol,
    setFilesQueue,
    handleStartAnalysis,
    handleLoadSample,
    downloadingPdf,
    downloadingPptx,
    handleDownloadPdf,
    handleDownloadPptx,
    handleReset,
    handleRefresh,
    isNarrativeExpanded,
    setIsNarrativeExpanded,
    effectiveCharts,
    isAdmin,
    chatMessages,
    setChatMessages,
    handleChartOverride,
  } = useDashboardState();

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <LoadingAnalysis
            fileSize={filesQueue[currentFileIndex]?.size}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            currentFile={currentFileIndex + 1}
            totalFiles={filesQueue.length}
          />
        ) : !result ? (
          <DashboardUploader
            filesQueue={filesQueue}
            targetCol={targetCol}
            onFilesSelected={setFilesQueue}
            onTargetColChange={setTargetCol}
            onStartAnalysis={handleStartAnalysis}
            onLoadSampleData={handleLoadSample}
          />
        ) : (
          <div className="space-y-6">
            <DashboardHeader
              result={result}
              downloadingPdf={downloadingPdf}
              downloadingPptx={downloadingPptx}
              onDownloadPdf={handleDownloadPdf}
              onDownloadPptx={handleDownloadPptx}
              onReset={handleReset}
              onRefresh={handleRefresh}
            />

            <KPICards kpis={result.kpis} />

            <div className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <ExecutiveSummary
                  narrative={result.narrative}
                  isExpanded={isNarrativeExpanded}
                  onToggleExpand={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
                />

                <ExploratoryCharts
                  charts={effectiveCharts}
                  filename={result.filename}
                />

                <ForecastSection
                  chartData={result.forecast?.chartData}
                  filename={result.filename}
                />

                <SegmentationSection
                  scatterData={result.segmentation?.scatterData}
                  radarData={result.segmentation?.radarData}
                  filename={result.filename}
                />

                <AnomaliesSection
                  chartData={result.anomalies?.chartData}
                  filename={result.filename}
                />

                <FeatureImportanceSection
                  chartImportance={result.featureImportance?.chartImportance}
                  chartShap={result.featureImportance?.chartShap}
                  filename={result.filename}
                />
              </div>
            </div>

            <DashboardChat
              isAdmin={isAdmin}
              result={result}
              charts={effectiveCharts}
              messages={chatMessages}
              onMessagesChange={setChatMessages}
              onChartOverride={handleChartOverride}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafc] flex items-center justify-center text-gray-400">
          Cargando...
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
