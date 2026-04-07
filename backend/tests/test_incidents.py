import pytest
from uuid import uuid4
from app.models import User, Incident, IncidentStatus, IncidentSeverity


@pytest.fixture
def test_user(db):
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        global_role="member"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_incident(db, test_user):
    """Create a test incident."""
    incident = Incident(
        title="Test Incident",
        description="Test description",
        severity=IncidentSeverity.SEV2,
        status=IncidentStatus.DETECTED,
        commander_id=test_user.id
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def test_create_incident(db, test_user):
    """Test creating an incident."""
    incident = Incident(
        title="API Latency Spike",
        description="Users reporting slow response times",
        severity=IncidentSeverity.SEV1,
        status=IncidentStatus.DETECTED,
        commander_id=test_user.id
    )
    db.add(incident)
    db.commit()
    
    assert incident.id is not None
    assert incident.status == IncidentStatus.DETECTED
    assert incident.commander_id == test_user.id


def test_incident_status_workflow(db, test_incident):
    """Test incident status transitions."""
    # Start in DETECTED
    assert test_incident.status == IncidentStatus.DETECTED
    
    # Move to ACKNOWLEDGED
    test_incident.status = IncidentStatus.ACKNOWLEDGED
    db.commit()
    assert test_incident.status == IncidentStatus.ACKNOWLEDGED
    
    # Move to MITIGATING
    test_incident.status = IncidentStatus.MITIGATING
    db.commit()
    assert test_incident.status == IncidentStatus.MITIGATING
    
    # Move to RESOLVED
    test_incident.status = IncidentStatus.RESOLVED
    db.commit()
    assert test_incident.status == IncidentStatus.RESOLVED
    
    # Move to POSTMORTEM
    test_incident.status = IncidentStatus.POSTMORTEM
    db.commit()
    assert test_incident.status == IncidentStatus.POSTMORTEM


def test_incident_severity_levels(db, test_user):
    """Test all severity levels."""
    for severity in [IncidentSeverity.SEV1, IncidentSeverity.SEV2, 
                     IncidentSeverity.SEV3, IncidentSeverity.SEV4]:
        incident = Incident(
            title=f"Test {severity.value}",
            description="Test",
            severity=severity,
            commander_id=test_user.id
        )
        db.add(incident)
        db.commit()
        assert incident.severity == severity
