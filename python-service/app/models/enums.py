from enum import Enum


class OperatorPlan(str, Enum):
    starter = "starter"
    growth = "growth"
    business = "business"


class RiderStatus(str, Enum):
    available = "available"
    on_delivery = "on_delivery"
    offline = "offline"


class JobStatus(str, Enum):
    created = "created"
    assigned = "assigned"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    failed = "failed"
