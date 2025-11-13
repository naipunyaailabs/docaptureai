"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSSEPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);

  const connectToSSE = () => {
    // Generate a random run ID
    const newRunId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setRunId(newRunId);
    
    // Create EventSource connection
    const eventSource = new EventSource(`http://localhost:5000/agui-sse?runId=${newRunId}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        setEvents(prev => [...prev, eventData]);
        console.log('Received SSE event:', eventData);
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };
    
    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
    };
  };

  const disconnectFromSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setEvents([]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">SSE Connection Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Connection Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={connectToSSE}
                disabled={isConnected}
              >
                Connect to SSE
              </Button>
              <Button 
                variant="destructive"
                onClick={disconnectFromSSE}
                disabled={!isConnected}
              >
                Disconnect
              </Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Connection Status:</p>
              <p className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "Connected" : "Disconnected"}
              </p>
              
              {runId && (
                <p className="mt-2">
                  <span className="font-medium">Run ID:</span> {runId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Received Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-auto border rounded-lg p-4 bg-muted">
              {events.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events received yet. Connect to SSE to start receiving events.
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div key={index} className="p-3 bg-background rounded border">
                      <div className="font-medium text-sm">
                        {event.type} - {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                      {event.data && (
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}