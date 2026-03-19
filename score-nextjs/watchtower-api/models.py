from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Agent(Base):
    __tablename__ = "agents"

    id                    = Column(Integer, primary_key=True, index=True)
    name                  = Column(String, nullable=False)
    ticker                = Column(String, nullable=False)
    color                 = Column(String, nullable=False)

    # Bond Score dimensions (1-100 each)
    performance_score     = Column(Integer, nullable=False)
    risk_score            = Column(Integer, nullable=False)
    stability_score       = Column(Integer, nullable=False)
    sentiment_score       = Column(Integer, nullable=False)
    provenance_score      = Column(Integer, nullable=False)

    # Risk metrics
    sharpe                = Column(Float, nullable=False)
    max_drawdown          = Column(Float, nullable=False)
    leverage              = Column(Float, nullable=False)
    liquidation_proximity = Column(String, nullable=False)   # Low/Medium/High
    liquidity_exposure    = Column(String, nullable=False)   # Low/Medium/High
    protocol_diversity    = Column(Integer, nullable=False)
    credit_capacity       = Column(Integer, nullable=False)  # USD

    # Season 0 performance data
    total_volume          = Column(Float, nullable=True)
    total_yield           = Column(Float, nullable=True)
    native_yield          = Column(Float, nullable=True)
    reward_yield          = Column(Float, nullable=True)
    capital_apy_total     = Column(Float, nullable=True)
    capital_apy_native    = Column(Float, nullable=True)
    reward_dependency     = Column(Float, nullable=True)
    capital_deployed      = Column(Float, nullable=True)
    capital_turnover      = Column(Float, nullable=True)
    transaction_count     = Column(Integer, nullable=True)
    cadence               = Column(Float, nullable=True)
    tyr                   = Column(Float, nullable=True)
    yield_per_1k_capital  = Column(Float, nullable=True)

    # Metadata
    strategy_type         = Column(String, nullable=True)
    strategy_description  = Column(String, nullable=True)
    strategy_notes        = Column(String, nullable=False)

    # Scoring state
    score_trend           = Column(String, nullable=True)    # "up"/"down"/"stable"
    days_since_scored     = Column(Integer, nullable=True)
    last_updated          = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def compute_bond_score(agent: Agent) -> int:
    return round(
        agent.performance_score * 0.30 +
        agent.risk_score        * 0.25 +
        agent.stability_score   * 0.20 +
        agent.sentiment_score   * 0.15 +
        agent.provenance_score  * 0.10
    )


def compute_grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 75: return "B+"
    if score >= 70: return "B"
    if score >= 65: return "B-"
    if score >= 60: return "C+"
    return "C"
