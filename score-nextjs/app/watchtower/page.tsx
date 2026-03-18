import WatchtowerNav from '../components/watchtower/WatchtowerNav';
import Hero from '../components/watchtower/Hero';
import DifferentiationStrip from '../components/watchtower/DifferentiationStrip';
import PortfolioOverview from '../components/watchtower/PortfolioOverview';
import Timeline from '../components/watchtower/Timeline';
import AgentCards from '../components/watchtower/AgentCards';
import StrategicPriorities from '../components/watchtower/StrategicPriorities';
import ERC8004Section from '../components/watchtower/ERC8004Section';
import Methodology from '../components/watchtower/Methodology';
import FootnoteStrip from '../components/watchtower/FootnoteStrip';
import ScrollReveal from '../components/watchtower/ScrollReveal';

export default function WatchtowerPage() {
  return (
    <>
      <WatchtowerNav />
      <Hero />
      <DifferentiationStrip />
      <PortfolioOverview />
      <Timeline />
      <section className="sec" id="scores">
        <div className="wrap">
          <div className="sh reveal">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="stag" style={{ marginBottom: 0 }}>AGENT REPORTS</div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(204,255,0,0.2)', color: 'var(--lime)', background: 'rgba(204,255,0,0.05)', fontFamily: 'var(--mono)' }}>
                GENESIS · STATIC DATA
              </span>
            </div>
            <h2 className="sh2">Bond Scores</h2>
            <p className="sdesc">
              Click any agent card to open its full credit report. Bond Scores, credit capacities, and risk metrics
              reflect Genesis (Nov 2024 – Feb 2025) final evaluation data.
            </p>
          </div>
          <AgentCards />
        </div>
      </section>
      <StrategicPriorities />
      <ERC8004Section />
      <Methodology />
      <FootnoteStrip />
      <ScrollReveal />
    </>
  );
}
