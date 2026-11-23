// Warning shown when a stored helmet is past its retrieval time
import Notice from './Notice';
import { feesFor, graceLeft, peso } from '../utils/pricing';
import { LATE } from '../utils/lateRules';

export default function LateNotice({ reservation: r, style }) {
  if (!r || r.status !== 'stored' || !r.is_late) return null;

  const left = graceLeft(r.end_time);
  if (left > 0) {
    return (
      <Notice kind="warning" style={style}>
        Your retrieval time has passed. Get your helmet within {left} minute{left > 1 ? 's' : ''} to avoid a late fee.
      </Notice>
    );
  }

  const f = feesFor(r);
  return (
    <Notice kind="danger" style={style}>
      {f.overnight
        ? `Your helmet was left overnight, so the ${peso(LATE.max)} overnight fee was added. Pay ${peso(f.due_at_retrieval)} at the locker to get your helmet.`
        : `You're late, so a ${peso(f.late_fee)} late fee was added (${peso(LATE.perHour)} per late hour, max ${peso(LATE.max)}). Pay ${peso(f.due_at_retrieval)} at the locker to get your helmet.`}
    </Notice>
  );
}
