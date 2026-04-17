import { useEffect, useMemo } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { divIcon, type LatLngExpression } from 'leaflet';
import type { AlertRecord, PatrolPoint, PlannedRoute, UserProfile } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, getPatrollerTrackingStatus, googleMapsDirectionsUrl } from '../utils';

interface DraftPoint {
  lat: number;
  lng: number;
}

interface MapPanelProps {
  profile: UserProfile;
  activePatrollers: UserProfile[];
  alerts: AlertRecord[];
  plannedRoutes: PlannedRoute[];
  viewerRoute: PatrolPoint[];
  selectedPatrollerRoute: PatrolPoint[];
  draftRoutePoints: DraftPoint[];
  draftRouteAnchors: DraftPoint[];
  drawMode: boolean;
  focusedUser: UserProfile | null;
  onAddDraftPoint: (point: DraftPoint) => Promise<void> | void;
}

const ownMarker = divIcon({ className: 'map-pin map-pin--self', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] });
const peerMarker = divIcon({ className: 'map-pin map-pin--peer', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
const alertMarker = divIcon({ className: 'map-pin map-pin--alert', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] });

function FocusController({ focus }: { focus: DraftPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [focus, map]);

  return null;
}

function DraftRouteCapture({ enabled, onAddDraftPoint }: { enabled: boolean; onAddDraftPoint: (point: DraftPoint) => void }) {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onAddDraftPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function toPolyline(points: Array<{ lat: number; lng: number }>): LatLngExpression[] {
  return points.map((point) => [point.lat, point.lng]);
}

export function MapPanel({
  profile,
  activePatrollers,
  alerts,
  plannedRoutes,
  viewerRoute,
  selectedPatrollerRoute,
  draftRoutePoints,
  draftRouteAnchors,
  drawMode,
  focusedUser,
  onAddDraftPoint,
}: MapPanelProps) {
  const ownLocation = profile.lastLocation;

  const focus = focusedUser?.lastLocation
    ? { lat: focusedUser.lastLocation.lat, lng: focusedUser.lastLocation.lng }
    : ownLocation
      ? { lat: ownLocation.lat, lng: ownLocation.lng }
      : null;

  const center = useMemo<[number, number]>(() => {
    if (focus) return [focus.lat, focus.lng];
    return DEFAULT_CENTER;
  }, [focus]);

  return (
    <div className="map-shell">
      <MapContainer center={center} zoom={DEFAULT_ZOOM} scrollWheelZoom className="map-surface">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FocusController focus={focus} />
        <DraftRouteCapture enabled={drawMode} onAddDraftPoint={onAddDraftPoint} />

        {plannedRoutes.map((route) => (
          route.points.length > 1 ? (
            <Polyline
              key={route.id}
              positions={toPolyline(route.points)}
              pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.55 }}
            >
              <Popup>
                <strong>{route.name}</strong>
                <div>Planned by @{route.username}</div>
              </Popup>
            </Polyline>
          ) : null
        ))}

        {viewerRoute.length > 1 ? (
          <Polyline
            positions={toPolyline(viewerRoute)}
            pathOptions={{ color: '#22d3ee', weight: 5, opacity: 0.85 }}
          />
        ) : null}

        {selectedPatrollerRoute.length > 1 ? (
          <Polyline
            positions={toPolyline(selectedPatrollerRoute)}
            pathOptions={{ color: '#e2e8f0', weight: 4, opacity: 0.75 }}
          />
        ) : null}

        {draftRoutePoints.length > 1 ? (
          <Polyline
            positions={toPolyline(draftRoutePoints)}
            pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.9, dashArray: '8 8' }}
          />
        ) : null}


        {draftRouteAnchors.map((point, index) => (
          <CircleMarker
            key={`draft-anchor-${index}`}
            center={[point.lat, point.lng]}
            radius={6}
            pathOptions={{ color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.92 }}
          >
            <Popup>
              <strong>{index === 0 ? 'Route start' : `Route stop ${index + 1}`}</strong>
            </Popup>
          </CircleMarker>
        ))}


        {ownLocation ? (
          <>
            <Marker position={[ownLocation.lat, ownLocation.lng]} icon={ownMarker}>
              <Popup>
                <strong>You</strong>
                <div>{profile.isPatrolling ? 'Patrol active' : 'Viewing only'}</div>
              </Popup>
            </Marker>
            {typeof ownLocation.accuracy === 'number' ? (
              <Circle
                center={[ownLocation.lat, ownLocation.lng]}
                radius={ownLocation.accuracy}
                pathOptions={{ color: '#22d3ee', opacity: 0.25 }}
              />
            ) : null}
          </>
        ) : null}

        {activePatrollers
          .filter((user) => user.uid !== profile.uid && user.lastLocation)
          .map((user) => (
            <Marker
              key={user.uid}
              position={[user.lastLocation!.lat, user.lastLocation!.lng]}
              icon={peerMarker}
            >
              <Popup>
                <strong>@{user.username}</strong>
                <div>{getPatrollerTrackingStatus(user).paused ? 'Tracking paused' : 'Active patrol'}</div>
                <div>{getPatrollerTrackingStatus(user).detail}</div>
                <a
                  className="popup-link"
                  href={googleMapsDirectionsUrl(user.lastLocation!.lat, user.lastLocation!.lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open directions
                </a>
              </Popup>
            </Marker>
          ))}

        {alerts
          .filter((alert) => alert.active && alert.location)
          .map((alert) => (
            <Marker
              key={alert.id}
              position={[alert.location!.lat, alert.location!.lng]}
              icon={alertMarker}
            >
              <Popup>
                <strong>Assistance request</strong>
                <div>@{alert.username}</div>
                <p>{alert.message || 'Help requested.'}</p>
                <a
                  className="popup-link"
                  href={googleMapsDirectionsUrl(alert.location!.lat, alert.location!.lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Start directions
                </a>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
