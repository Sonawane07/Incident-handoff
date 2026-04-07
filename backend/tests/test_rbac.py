import pytest
from uuid import uuid4
from app.models import User, Incident, IncidentRole, RoleType, IncidentSeverity, IncidentStatus
from app.auth import check_incident_permission


@pytest.fixture
def commander(db):
    """Create commander user."""
    user = User(id=uuid4(), email="commander@example.com", global_role="member")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def responder(db):
    """Create responder user."""
    user = User(id=uuid4(), email="responder@example.com", global_role="member")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def viewer(db):
    """Create viewer user."""
    user = User(id=uuid4(), email="viewer@example.com", global_role="member")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def incident_with_roles(db, commander, responder, viewer):
    """Create incident with assigned roles."""
    incident = Incident(
        title="Test Incident",
        description="Test",
        severity=IncidentSeverity.SEV2,
        status=IncidentStatus.DETECTED,
        commander_id=commander.id
    )
    db.add(incident)
    db.flush()
    
    # Add commander role
    commander_role = IncidentRole(
        incident_id=incident.id,
        user_id=commander.id,
        role=RoleType.COMMANDER,
        assigned_by_id=commander.id
    )
    db.add(commander_role)
    
    # Add responder role
    responder_role = IncidentRole(
        incident_id=incident.id,
        user_id=responder.id,
        role=RoleType.RESPONDER,
        assigned_by_id=commander.id
    )
    db.add(responder_role)
    
    # Add viewer role
    viewer_role = IncidentRole(
        incident_id=incident.id,
        user_id=viewer.id,
        role=RoleType.VIEWER,
        assigned_by_id=commander.id
    )
    db.add(viewer_role)
    
    db.commit()
    db.refresh(incident)
    return incident


def test_commander_has_full_access(db, commander, incident_with_roles):
    """Test commander has all permissions."""
    assert check_incident_permission(commander, incident_with_roles, "commander") == True
    assert check_incident_permission(commander, incident_with_roles, "responder") == True
    assert check_incident_permission(commander, incident_with_roles, "viewer") == True


def test_responder_has_limited_access(db, responder, incident_with_roles):
    """Test responder permissions."""
    assert check_incident_permission(responder, incident_with_roles, "commander") == False
    assert check_incident_permission(responder, incident_with_roles, "responder") == True
    assert check_incident_permission(responder, incident_with_roles, "viewer") == True


def test_viewer_has_read_only_access(db, viewer, incident_with_roles):
    """Test viewer permissions."""
    assert check_incident_permission(viewer, incident_with_roles, "commander") == False
    assert check_incident_permission(viewer, incident_with_roles, "responder") == False
    assert check_incident_permission(viewer, incident_with_roles, "viewer") == True


def test_non_team_member_has_no_access(db, incident_with_roles):
    """Test non-team member has no access."""
    outsider = User(id=uuid4(), email="outsider@example.com", global_role="member")
    db.add(outsider)
    db.commit()
    
    assert check_incident_permission(outsider, incident_with_roles, "viewer") == False
