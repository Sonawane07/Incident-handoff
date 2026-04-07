from typing import Dict, List
from ..models import IncidentStatus

# Define valid status transitions
STATUS_TRANSITIONS: Dict[IncidentStatus, List[IncidentStatus]] = {
    IncidentStatus.DETECTED: [IncidentStatus.ACKNOWLEDGED],
    IncidentStatus.ACKNOWLEDGED: [IncidentStatus.MITIGATING],
    IncidentStatus.MITIGATING: [IncidentStatus.RESOLVED],
    IncidentStatus.RESOLVED: [IncidentStatus.POSTMORTEM],
    IncidentStatus.POSTMORTEM: [],  # Terminal state
}


def is_valid_transition(from_status: IncidentStatus, to_status: IncidentStatus) -> bool:
    """Check if a status transition is valid."""
    valid_next_states = STATUS_TRANSITIONS.get(from_status, [])
    return to_status in valid_next_states


def get_valid_next_statuses(current_status: IncidentStatus) -> List[IncidentStatus]:
    """Get list of valid next statuses from current status."""
    return STATUS_TRANSITIONS.get(current_status, [])


class StatusTransitionError(Exception):
    """Raised when an invalid status transition is attempted."""
    pass
