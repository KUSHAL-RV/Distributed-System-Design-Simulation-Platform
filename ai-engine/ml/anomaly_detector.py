import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np

class AnomalyDetector:
    def __init__(self, window_size: int = 200, contamination: float = 0.05):
        """
        Maintains a rolling window of Kafka metrics and flags node abnormalities.
        window_size: How many records to store in moving frame per simulation.
        contamination: The proportion of outliers expected in the strict dataset.
        """
        self.window_size = window_size
        self.contamination = contamination
        # Dict containing DataFrames indexed by active simulation_id
        self.history = {}

    def push_metric(self, sim_id: str, payload: dict):
        """
        Appends new metric dict to the underlying buffer and pops oldest elements.
        """
        if sim_id not in self.history:
            self.history[sim_id] = []
        
        # We only really care about Latency and Error triggers for node-level bottlenecks.
        self.history[sim_id].append({
            "node_id": payload.get("node_id"),
            "latency": payload.get("latency", 0),
            "error": 1 if not payload.get("success", True) else 0
        })

        if len(self.history[sim_id]) > self.window_size:
            self.history[sim_id].pop(0)

    def analyze(self, sim_id: str) -> list[dict]:
        """
        Runs the Scikit-learn isolation forest on the current window evaluating nodes against the flow.
        """
        if sim_id not in self.history or len(self.history[sim_id]) < 50:
            return [] # Not enough data to model anomalies

        df = pd.DataFrame(self.history[sim_id])
        
        # Aggregate the mean metrics per node in the current buffer
        # This identifies static outliers (e.g. Node 3 runs drastically slower than Node 1 and Node 2)
        node_stats = df.groupby("node_id").agg(
            avg_latency=('latency', 'mean'),
            error_rate=('error', 'mean'),
            count=('node_id', 'count')
        ).reset_index()

        # If a single node is the entirety of the requests, no comparative isolation can run.
        if len(node_stats) < 2:
            return []

        # Feature matrix: normalize values slightly or just rely on the forest mapping
        X = node_stats[['avg_latency', 'error_rate']].values
        
        # Train & Predict
        # If dataset is strictly identical, Isolation Forest throws warnings or skips, we guard against 0 variance
        if np.var(X[:, 0]) == 0 and np.var(X[:, 1]) == 0:
            return []

        model = IsolationForest(contamination=self.contamination, random_state=42)
        preds = model.fit_predict(X)
        
        node_stats['anomaly'] = preds
        
        # Anomalies are labeled as -1. 
        # But we only want 'bottleneck' anomalies (i.e. highest latency or error rate, not suspiciously fast ones).
        outliers = node_stats[node_stats['anomaly'] == -1]

        insights = []
        for _, row in outliers.iterrows():
            # If the outlier is "worse" than the population mean, it is a bottleneck
            if row['avg_latency'] > node_stats['avg_latency'].mean() or row['error_rate'] > node_stats['error_rate'].mean():
                reason = "Severe Performance Degradation"
                if row['error_rate'] > 0.1:
                    reason = "Cascading Error Generation"
                    
                insights.append({
                    "nodeId": row['node_id'],
                    "type": "BOTTLENECK",
                    "reason": reason,
                    "avgLatency": float(row['avg_latency']),
                    "errorRate": float(row['error_rate']),
                    "confidence": 0.85 # Heuristic mapping
                })
                
        return insights
