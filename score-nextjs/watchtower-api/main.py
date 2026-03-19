import os
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import engine, get_db, Base
from models import Agent, compute_bond_score, compute_grade

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Watchtower API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("WATCHTOWER_API_KEY", "dev-key")


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class AgentSummary(BaseModel):
    id: int
    name: str
    ticker: str
    color: str
    bond_score: int
    grade: str
    performance_score: int
    risk_score: int
    stability_score: int
    sentiment_score: int
    provenance_score: int
    sharpe: float
    max_drawdown: float
    leverage: float
    credit_capacity: int
    score_trend: Optional[str] = None
    days_since_scored: Optional[int] = None
    last_updated: datetime
    capital_apy_total: Optional[float] = None
    reward_dependency: Optional[float] = None
    protocol_diversity: Optional[int] = None

    class Config:
        from_attributes = True


class AgentFull(AgentSummary):
    liquidation_proximity: str
    liquidity_exposure: str
    protocol_diversity: int
    strategy_notes: str
    total_volume: Optional[float] = None
    total_yield: Optional[float] = None
    native_yield: Optional[float] = None
    reward_yield: Optional[float] = None
    capital_apy_total: Optional[float] = None
    capital_apy_native: Optional[float] = None
    reward_dependency: Optional[float] = None
    capital_deployed: Optional[float] = None
    capital_turnover: Optional[float] = None
    transaction_count: Optional[int] = None
    cadence: Optional[float] = None
    tyr: Optional[float] = None
    yield_per_1k_capital: Optional[float] = None
    strategy_type: Optional[str] = None
    strategy_description: Optional[str] = None


class AgentUpdate(BaseModel):
    performance_score: Optional[int] = None
    risk_score: Optional[int] = None
    stability_score: Optional[int] = None
    sentiment_score: Optional[int] = None
    provenance_score: Optional[int] = None
    sharpe: Optional[float] = None
    max_drawdown: Optional[float] = None
    leverage: Optional[float] = None
    liquidation_proximity: Optional[str] = None
    liquidity_exposure: Optional[str] = None
    protocol_diversity: Optional[int] = None
    credit_capacity: Optional[int] = None
    score_trend: Optional[str] = None
    days_since_scored: Optional[int] = None
    strategy_notes: Optional[str] = None


class WatchtowerSummary(BaseModel):
    total_agents: int
    avg_bond_score: float
    total_credit_capacity: int
    last_updated: datetime


# ── Helpers ──────────────────────────────────────────────────────────────────

def to_summary(a: Agent) -> AgentSummary:
    score = compute_bond_score(a)
    return AgentSummary(
        id=a.id, name=a.name, ticker=a.ticker, color=a.color,
        bond_score=score, grade=compute_grade(score),
        performance_score=a.performance_score, risk_score=a.risk_score,
        stability_score=a.stability_score, sentiment_score=a.sentiment_score,
        provenance_score=a.provenance_score,
        sharpe=a.sharpe, max_drawdown=a.max_drawdown, leverage=a.leverage,
        credit_capacity=a.credit_capacity,
        score_trend=a.score_trend, days_since_scored=a.days_since_scored,
        last_updated=a.last_updated,
        capital_apy_total=a.capital_apy_total,
        reward_dependency=a.reward_dependency,
        protocol_diversity=a.protocol_diversity,
    )


def to_full(a: Agent) -> AgentFull:
    score = compute_bond_score(a)
    return AgentFull(
        id=a.id, name=a.name, ticker=a.ticker, color=a.color,
        bond_score=score, grade=compute_grade(score),
        performance_score=a.performance_score, risk_score=a.risk_score,
        stability_score=a.stability_score, sentiment_score=a.sentiment_score,
        provenance_score=a.provenance_score,
        sharpe=a.sharpe, max_drawdown=a.max_drawdown, leverage=a.leverage,
        credit_capacity=a.credit_capacity,
        score_trend=a.score_trend, days_since_scored=a.days_since_scored,
        last_updated=a.last_updated,
        liquidation_proximity=a.liquidation_proximity,
        liquidity_exposure=a.liquidity_exposure,
        protocol_diversity=a.protocol_diversity,
        strategy_notes=a.strategy_notes,
        total_volume=a.total_volume, total_yield=a.total_yield,
        native_yield=a.native_yield, reward_yield=a.reward_yield,
        capital_apy_total=a.capital_apy_total, capital_apy_native=a.capital_apy_native,
        reward_dependency=a.reward_dependency, capital_deployed=a.capital_deployed,
        capital_turnover=a.capital_turnover, transaction_count=a.transaction_count,
        cadence=a.cadence, tyr=a.tyr, yield_per_1k_capital=a.yield_per_1k_capital,
        strategy_type=a.strategy_type, strategy_description=a.strategy_description,
    )


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/agents", response_model=List[AgentSummary])
def list_agents(db: Session = Depends(get_db)):
    return [to_summary(a) for a in db.query(Agent).order_by(Agent.id).all()]


@app.get("/api/agents/{agent_id}", response_model=AgentFull)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    a = db.query(Agent).filter(Agent.id == agent_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Agent not found")
    return to_full(a)


@app.get("/api/watchtower/summary", response_model=WatchtowerSummary)
def watchtower_summary(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    if not agents:
        raise HTTPException(status_code=404, detail="No agents found")
    scores = [compute_bond_score(a) for a in agents]
    return WatchtowerSummary(
        total_agents=len(agents),
        avg_bond_score=round(sum(scores) / len(scores), 1),
        total_credit_capacity=sum(a.credit_capacity for a in agents),
        last_updated=max(a.last_updated for a in agents),
    )


@app.put("/api/agents/{agent_id}", response_model=AgentFull)
def update_agent(
    agent_id: int,
    payload: AgentUpdate,
    x_api_key: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    a = db.query(Agent).filter(Agent.id == agent_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Agent not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(a, field, value)
    a.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(a)
    return to_full(a)
