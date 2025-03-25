import React, { useRef, useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ZoomIn, ZoomOut, MoveHorizontal } from 'lucide-react';
import type { ProcessEvent } from '../types';

interface TimelineProps {
  events: ProcessEvent[];
  crimeDate: Date | null;
}

export const Timeline: React.FC<TimelineProps> = ({ events, crimeDate }) => {
  const [scale, setScale] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [autoCenter, setAutoCenter] = useState(true);

  const validEvents = events
    .filter((event) => event.date !== null)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const calculateTimelineWidth = () => {
    if (!crimeDate || validEvents.length === 0) return '100%';
    const firstDate = crimeDate;
    const lastDate = validEvents[validEvents.length - 1].date!;
    const totalDays = differenceInDays(lastDate, firstDate);
    return `${Math.max(totalDays * 10 * scale, 100)}px`;
  };

  const calculateEventPosition = (eventDate: Date) => {
    if (!crimeDate) return 0;
    const totalDays = differenceInDays(eventDate, crimeDate);
    return `${totalDays * 10 * scale}px`;
  };

  const calculateDurationBetweenEvents = (event1: ProcessEvent, event2: ProcessEvent) => {
    if (!event1.date || !event2.date) return null;
    const days = differenceInDays(event2.date, event1.date);
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return `${months} meses y ${remainingDays} días`;
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.5, 0.5));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
    setAutoCenter(false);
  };

  const centerTimeline = () => {
    if (!timelineRef.current || validEvents.length === 0) return;
    
    const timelineWidth = timelineRef.current.scrollWidth;
    const viewportWidth = timelineRef.current.clientWidth;
    const middleEvent = validEvents[Math.floor(validEvents.length / 2)];
    
    if (middleEvent && middleEvent.date) {
      const middlePosition = parseInt(calculateEventPosition(middleEvent.date));
      const scrollTo = Math.max(0, middlePosition - (viewportWidth / 2));
      timelineRef.current.scrollLeft = scrollTo;
      setScrollPosition(scrollTo);
    }
  };

  useEffect(() => {
    if (autoCenter) {
      centerTimeline();
    } else if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollPosition;
    }
  }, [scale, validEvents, autoCenter]);

  if (!crimeDate || validEvents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Ingrese la fecha del hecho y al menos un evento para visualizar la línea temporal
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={() => {
            setAutoCenter(true);
            centerTimeline();
          }}
          className="p-2 rounded-full hover:bg-gray-100 flex items-center"
          title="Centrar línea temporal"
        >
          <MoveHorizontal className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Alejar"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Acercar"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={timelineRef}
        className="overflow-x-auto pb-4"
        onScroll={handleScroll}
      >
        <div
          className="relative h-32"
          style={{ width: calculateTimelineWidth() }}
        >
          {/* Línea base */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gray-300" />

          {/* Fecha del hecho */}
          <div className="absolute top-0 left-0">
            <div className="h-32 w-0.5 bg-red-500" />
            <div className="absolute -left-20 top-32 w-40 text-center text-sm text-red-700 font-semibold">
              Fecha del hecho
              <br />
              {format(crimeDate, 'dd/MM/yyyy', { locale: es })}
            </div>
          </div>

          {/* Eventos y duraciones */}
          {validEvents.map((event, index) => {
            const prevEvent = index > 0 ? validEvents[index - 1] : null;
            const duration = prevEvent ? calculateDurationBetweenEvents(prevEvent, event) : null;

            return (
              <div key={event.id}>
                {/* Duración entre eventos */}
                {duration && (
                  <div
                    className="absolute top-4 text-xs text-gray-500"
                    style={{
                      left: calculateEventPosition(prevEvent!.date!),
                      width: `calc(${calculateEventPosition(event.date!)} - ${calculateEventPosition(prevEvent!.date!)})`,
                      textAlign: 'center'
                    }}
                  >
                    {duration}
                  </div>
                )}

                {/* Evento */}
                <div
                  className="absolute top-8"
                  style={{ left: calculateEventPosition(event.date!) }}
                >
                  <div
                    className={`h-24 w-0.5 ${
                      event.isInterruption 
                        ? 'bg-indigo-600' 
                        : 'bg-gray-600'
                    }`}
                  />
                  <div
                    className={`absolute -left-20 -top-6 w-40 text-center text-sm
                      ${event.isInterruption 
                        ? 'text-indigo-700 font-semibold' 
                        : 'text-gray-700'
                      }`}
                  >
                    {event.name}
                    <br />
                    {format(event.date!, 'dd/MM/yyyy', { locale: es })}
                  </div>
                  {event.isInterruption && (
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 rounded-full bg-indigo-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};