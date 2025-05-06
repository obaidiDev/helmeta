// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import WorkerList from '../components/WorkerList';
// import PredictionAnalysisContainer from '../components/PredictionAnalysisContainer';
import AlertsContainer from '../components/AlertsContainer';
import RiskAssessmentContainer from '../components/RiskAssessmentContainer';
import IndoorMap from '../components/IndoorMap';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [predictionAnalysis, setPredictionAnalysis] = useState([]);

  // Initial data fetch from the backend endpoints
  useEffect(() => {
    fetch('/api/workers')
      .then((res) => res.json())
      .then((data) => setWorkers(data));

    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => setAlerts(data));

    fetch('/api/risk-assessments')
      .then((res) => res.json())
      .then((data) => setRiskAssessments(data));

    // fetch('/api/prediction-analysis')
    //   .then((res) => res.json())
    //   .then((data) => setPredictionAnalysis(data));
  }, []);

  useEffect(() => {
    const socket = io('');
  
    socket.on('workersUpdate', setWorkers);
    socket.on('alertsUpdate', setAlerts);
    socket.on('riskAssessmentsUpdate', setRiskAssessments);
    // socket.on('predictionAnalysisUpdate', setPredictionAnalysis);
  
    return () => socket.disconnect();
  }, []);
  

  // Show components conditionally based on selected filters:
  const showAlerts = selectedFilters.length === 0 || selectedFilters.includes('alerts');
  const showWorkers = selectedFilters.length === 0 || selectedFilters.includes('workers');
  const showRisk = selectedFilters.length === 0 || selectedFilters.includes('risk');
  // const showPrediction = selectedFilters.length === 0 || selectedFilters.includes('prediction');

  // Filter each section based on the search query:
  const filteredAlerts = alerts.filter((alert) =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredWorkers = workers.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRisk = riskAssessments.filter((risk) =>
    risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    risk.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    risk.riskDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // const filteredPrediction = predictionAnalysis.filter((pa) =>
  //   pa.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   pa.description.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="w-screen min-h-screen bg-gray-100 px-14 py-10">
      <div className="mb-2">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className='mb-2'>
        <FilterBar selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
      </div>

      {/* Worker list */}
      {showWorkers && (
        <WorkerList workers={filteredWorkers} />
      )}

      <div className="grid grid-cols-5 gap-4 h-96">
        {/* Alerts */}
        {showAlerts && (
          <AlertsContainer alerts={filteredAlerts} />
        )}
        {/* Indoor map */}
        <IndoorMap workers={filteredWorkers} riskAssessments={filteredRisk} />
        {/* Risk Assessments */}
        {showRisk && (
          <RiskAssessmentContainer riskAssessments={filteredRisk} />
        )}
      </div>
      {/* Prediction Analysis */}
      {/* {showPrediction && (
        <div className="mt-4">
          <PredictionAnalysisContainer predictionAnalysis={filteredPrediction} />
        </div>
      )} */}
    </div>
  );
};

export default Dashboard;