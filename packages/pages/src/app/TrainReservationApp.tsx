import React, { Fragment, memo, useCallback, useMemo, type FormEventHandler } from 'react';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type Ticket = {
  '@type': 'Ticket';
  dateIssued?: Date | undefined;
  'dateIssued-output'?: PropertyValueSpecification | undefined;
  seat: Seat;
};

type TrainReservation = {
  '@id': string;
  '@type': 'TrainReservation';
  bookingTime?: Date | undefined;
  modifiedTime?: Date | undefined;
  priceCurrency?: string | undefined;
  reservationId?: string | undefined;
  'reservationId-output'?: PropertyValueSpecification | undefined;
  reservationStatus?: `Reservation${'Cancelled' | 'Confirmed' | 'Hold' | 'Pending'}` | undefined;
  'reservationStatus-output'?: PropertyValueSpecification;
  reservedTicket: Ticket;
  totalPrice?: number | undefined;
};

type PlanAction = {
  '@type': 'PlanAction';
  object: TrainTrip;
  result: TrainReservation;
};

type Seat = {
  '@type': 'Seat';
  seatingType: string;
  seatNumber: string;
  seatRow: string;
  seatSection: string;
};

type TrainStation = {
  '@type': 'TrainStation';
  alternateName?: string | undefined;
  name: string;
};

type TrainTrip = {
  '@type': 'TrainTrip';
  '@id': string;
  arrivalPlatform: string;
  arrivalStation: TrainStation;
  arrivalTime: string;
  departurePlatform: string;
  departureStation: TrainStation;
  departureTime: string;
  trainName: string;
  'trainName-input'?: PropertyValueSpecification | undefined;
  trainNumber: string;
  'trainNumber-input'?: PropertyValueSpecification | undefined;
};

const baseReservation: TrainReservation = {
  '@id': '8/21/B',
  '@type': 'TrainReservation',
  priceCurrency: 'JPY',
  'reservationId-output': {
    '@type': 'PropertyValueSpecification',
    valueName: 'id',
    valueRequired: true
  },
  reservationStatus: 'ReservationPending',
  'reservationStatus-output': {
    '@type': 'PropertyValueSpecification',
    valueName: 'status',
    valueRequired: true
  },
  reservedTicket: {
    '@type': 'Ticket',
    'dateIssued-output': {
      valueName: 'issued',
      valueRequired: true
    },
    seat: {
      '@type': 'Seat',
      seatingType: 'Reserved seat',
      seatNumber: '21',
      seatRow: 'B',
      seatSection: 'Car 8'
    }
  },
  totalPrice: 6590
} satisfies TrainReservation;

const availableReservations: [TrainReservation, TrainReservation, TrainReservation] = [
  {
    ...baseReservation
  },
  {
    ...baseReservation,
    '@id': '11/8/A',
    totalPrice: 8_860,
    reservedTicket: {
      ...baseReservation.reservedTicket,
      seat: {
        '@type': 'Seat',
        seatingType: 'Green',
        seatNumber: '8',
        seatRow: 'A',
        seatSection: 'Car 11'
      }
    }
  },
  {
    ...baseReservation,
    '@id': '12/2/A',
    totalPrice: 12_010,
    reservedTicket: {
      ...baseReservation.reservedTicket,
      seat: {
        '@type': 'Seat',
        seatingType: 'GranClass',
        seatNumber: '2',
        seatRow: 'A',
        seatSection: 'Car 12'
      }
    }
  }
];

const availableTrainTrips: [TrainTrip, TrainTrip, TrainTrip] = [
  {
    '@type': 'TrainTrip',
    '@id': 'toki/301',
    arrivalPlatform: '11・12',
    arrivalStation: { '@type': 'TrainStation', alternateName: '越後湯沢', name: 'Echigo-Yuzawa' },
    arrivalTime: '07:22',
    departurePlatform: '22',
    departureStation: { '@type': 'TrainStation', alternateName: '東京', name: 'Tokyo' },
    departureTime: '06:08',
    trainName: 'Toki',
    'trainName-input': { '@type': 'PropertyValueSpecification', valueName: 'name' },
    trainNumber: '301',
    'trainNumber-input': { '@type': 'PropertyValueSpecification', valueName: 'number' }
  },
  {
    '@type': 'TrainTrip',
    '@id': 'tanigawa/33',
    arrivalPlatform: '11・12',
    arrivalStation: { '@type': 'TrainStation', alternateName: '越後湯沢', name: 'Echigo-Yuzawa' },
    arrivalTime: '07:50',
    departurePlatform: '20',
    departureStation: { '@type': 'TrainStation', alternateName: '東京', name: 'Tokyo' },
    departureTime: '06:44',
    trainName: 'Tanigawa',
    'trainName-input': { '@type': 'PropertyValueSpecification', valueName: 'name' },
    trainNumber: '33',
    'trainNumber-input': { '@type': 'PropertyValueSpecification', valueName: 'number' }
  },
  {
    '@type': 'TrainTrip',
    '@id': 'tanigawa/401',
    arrivalPlatform: '11・12',
    arrivalStation: { '@type': 'TrainStation', alternateName: '越後湯沢', name: 'Echigo-Yuzawa' },
    arrivalTime: '08:02',
    departurePlatform: '23',
    departureStation: { '@type': 'TrainStation', alternateName: '東京', name: 'Tokyo' },
    departureTime: '06:36',
    trainName: 'Tanigawa',
    'trainName-input': { '@type': 'PropertyValueSpecification', valueName: 'name' },
    trainNumber: '401',
    'trainNumber-input': { '@type': 'PropertyValueSpecification', valueName: 'number' }
  }
];

const initialPlanAction: PlanAction = {
  '@type': 'PlanAction',
  object: availableTrainTrips[0],
  result: availableReservations[0]
};

const TrainReservationApp = () => {
  const [action, setAction, { inputValidity, submit }] = useSchemaOrgAction<PlanAction>(initialPlanAction, async () => {
    await new Promise(resolve => setTimeout(resolve, 1_000));

    return new Map<string, boolean | Date | number | string>([
      ['id', Math.random().toString(36).substring(2, 8).toUpperCase()],
      ['issued', new Date()],
      ['status', 'ReservationConfirmed']
    ]);
  });

  const currencyFormat = useMemo(
    () =>
      new Intl.NumberFormat([], {
        currency: action.result?.priceCurrency,
        currencyDisplay: 'symbol',
        style: 'currency'
      }),
    [action.result?.priceCurrency]
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();

      inputValidity.valid && submit();
    },
    [inputValidity, submit]
  );

  const handleSeatChange = useCallback<FormEventHandler<HTMLSelectElement>>(
    event => {
      const { currentTarget } = event;

      setAction(planAction => {
        const trainReservation: TrainReservation = {
          ...planAction.result,
          ...(availableReservations.find(reservation => reservation['@id'] === currentTarget.value) ||
            planAction.result)
        };

        trainReservation.reservedTicket.dateIssued = planAction.result.reservedTicket.dateIssued;

        return {
          ...planAction,
          result: trainReservation
        };
      });
    },
    [setAction]
  );

  const handleTrainChange = useCallback<FormEventHandler<HTMLSelectElement>>(
    event => {
      const { currentTarget } = event;

      setAction(planAction => ({
        ...planAction,
        object: availableTrainTrips.find(trip => trip['@id'] === currentTarget.value) || planAction.object
      }));
    },
    [setAction]
  );

  return (
    <section>
      <h2>Train reservation</h2>
      <form onSubmit={handleSubmit}>
        <dl>
          <dt>Train</dt>
          <dd>
            <select
              disabled={action.actionStatus === 'ActiveActionStatus'}
              onChange={handleTrainChange}
              value={action.object['@id']}
            >
              {availableTrainTrips.map(trainTrip => (
                <option value={trainTrip['@id']}>
                  {trainTrip.trainName} {trainTrip.trainNumber}
                </option>
              ))}
            </select>
          </dd>
          <dt>Depart from</dt>
          <dd>
            {action.object.departureStation.name} ({action.object.departureStation.alternateName})
          </dd>
          <dt>Arrive at</dt>
          <dd>
            {action.object.arrivalStation.name} ({action.object.arrivalStation.alternateName})
          </dd>
          <dt>Time</dt>
          <dd>
            {action.object.departureTime} -&gt; {action.object.arrivalTime}
          </dd>
          <dt>Seat</dt>
          <dd>
            <select
              disabled={action.actionStatus === 'ActiveActionStatus'}
              onChange={handleSeatChange}
              value={action.result['@id']}
            >
              {availableReservations.map(reservation => (
                <option value={reservation['@id']}>
                  ({reservation.reservedTicket.seat.seatingType}) {reservation.reservedTicket.seat.seatSection}{' '}
                  {reservation.reservedTicket.seat.seatNumber}
                  {reservation.reservedTicket.seat.seatRow}
                </option>
              ))}
            </select>
          </dd>
          <dt>Price</dt>
          <dd>{currencyFormat.format(action.result.totalPrice || 0)}</dd>
          <dt>Reservation status</dt>
          <dd>{action.result.reservationStatus}</dd>
          {action.result.reservationId && (
            <Fragment>
              <dt>Reservation ID</dt>
              <dd>{action.result.reservationId}</dd>
            </Fragment>
          )}
          {action.result.reservedTicket.dateIssued && (
            <Fragment>
              <dt>Issued date</dt>
              <dd>{action.result.reservedTicket.dateIssued.toLocaleString()}</dd>
            </Fragment>
          )}
        </dl>
        <button disabled={action.actionStatus === 'ActiveActionStatus'} type="submit">
          {action.actionStatus === 'ActiveActionStatus'
            ? 'Processing...'
            : action.actionStatus === 'CompletedActionStatus'
              ? 'Modify'
              : 'Reserve'}
        </button>
      </form>
    </section>
  );
};

export default memo(TrainReservationApp);
