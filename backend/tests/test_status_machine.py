import pytest
from app.services.status_machine import (
    is_valid_transition,
    get_valid_next_statuses,
    StatusTransitionError
)
from app.models import IncidentStatus


def test_valid_transitions():
    """Test valid status transitions."""
    assert is_valid_transition(IncidentStatus.DETECTED, IncidentStatus.ACKNOWLEDGED) == True
    assert is_valid_transition(IncidentStatus.ACKNOWLEDGED, IncidentStatus.MITIGATING) == True
    assert is_valid_transition(IncidentStatus.MITIGATING, IncidentStatus.RESOLVED) == True
    assert is_valid_transition(IncidentStatus.RESOLVED, IncidentStatus.POSTMORTEM) == True


def test_invalid_transitions():
    """Test invalid status transitions."""
    assert is_valid_transition(IncidentStatus.DETECTED, IncidentStatus.RESOLVED) == False
    assert is_valid_transition(IncidentStatus.ACKNOWLEDGED, IncidentStatus.DETECTED) == False
    assert is_valid_transition(IncidentStatus.MITIGATING, IncidentStatus.ACKNOWLEDGED) == False
    assert is_valid_transition(IncidentStatus.POSTMORTEM, IncidentStatus.DETECTED) == False


def test_get_valid_next_statuses():
    """Test getting valid next statuses."""
    assert get_valid_next_statuses(IncidentStatus.DETECTED) == [IncidentStatus.ACKNOWLEDGED]
    assert get_valid_next_statuses(IncidentStatus.ACKNOWLEDGED) == [IncidentStatus.MITIGATING]
    assert get_valid_next_statuses(IncidentStatus.MITIGATING) == [IncidentStatus.RESOLVED]
    assert get_valid_next_statuses(IncidentStatus.RESOLVED) == [IncidentStatus.POSTMORTEM]
    assert get_valid_next_statuses(IncidentStatus.POSTMORTEM) == []


def test_terminal_state():
    """Test that postmortem is a terminal state."""
    next_statuses = get_valid_next_statuses(IncidentStatus.POSTMORTEM)
    assert len(next_statuses) == 0
