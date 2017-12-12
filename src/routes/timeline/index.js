import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import style from './style';
import Timeline from '../../components/timeline/timeline';
import Hitlist from '../../components/timeline/hitlist';
import Toplist from '../../components/timeline/toplist';
import { dataLoad } from '../../lib/reducers/data';
import { applyFilter, filterActions } from '../../lib/reducers/filter';


class TimelineRoute extends Component {
  render () {
    const { dataUrl, loadData, data } = this.props;
    const wantedUrl = 'oproc-elias-2018.json';
    if (dataUrl !== wantedUrl) {
      setTimeout(() => {
        if (dataUrl !== wantedUrl) {
          loadData(wantedUrl);
        }
      }, 1000);
    }
    
    if(data.process == undefined) return "Daten werden noch geladen";
    let stakeholderOptions = [{ id: "", name: "…" }].concat(data.process.stakeholder).map(sh => <option value={sh.id}>{sh.name}</option>);

    const {
      filter,
      toggleParticipation,
      setProcVisibleWithout,
      setProcOnlyVisibleWith,
      toggleProcessMapping,
      toggleLaneOrder,
      toggleLaneWrap
    } = this.props;
    return (
      <div class={style.home}>
          <div class={style.filter}>
            <p><b>Swimmbahnen</b>
              <br />in Schwimmbahnen Prozesse zeigen von: <b onClick={toggleProcessMapping}>{filter.processMapping}</b>
              <br />leere Schwimmbahnen ausblenden: <b onClick={toggleLaneWrap}>{filter.laneWrap ? 'an' : 'aus'}</b>
              <br />Aphabetisch <b onClick={toggleLaneOrder}>{filter.laneOrder == 'asc' ? "aufsteigend" : "absteigend"}</b> sortieren
            </p><p><b>Prozese</b>
              <br />nur Prozesse mit <b onClick={toggleParticipation}>{filter.processParticipation}</b> Beteiligung anzeigen
              <br />nur Prozesse mit Beteiligung von: <select onChange={event => setProcOnlyVisibleWith(event.target.selectedOptions[0].value)}>{stakeholderOptions}</select>
              <br />nur Prozesse ohne Beteiligung von: <select onChange={event => setProcVisibleWithout(event.target.selectedOptions[0].value)}>{stakeholderOptions}</select>
            </p>
          </div>

          <div class={style.hitlist}>
            <Hitlist process={data} />
          </div>

          <div class={style.toplist}>
            <Toplist />
          </div>


        <div class={style.timeline}>
          <h4>{data.process.name}</h4>
          <Timeline
            width="600"
            height="1000"
            process={data}
            filter={filter}
           />
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ data, filter }) => ({
  dataUrl: data.wantedUrl,
  data: applyFilter(data.data, filter),
  filter,

});
const mapDispatchToProps = dispatch => ({
  loadData: dataLoad(dispatch),

  toggleParticipation: () => dispatch(filterActions.toggleParticipation()),
  setProcVisibleWithout: value => dispatch(filterActions.setProcVisibleWithout(value)),
  setProcOnlyVisibleWith: value => dispatch(filterActions.setProcOnlyVisibleWith(value)),
  toggleProcessMapping: () => dispatch(filterActions.toggleProcessMapping()),
  toggleLaneOrder: () => dispatch(filterActions.toggleLaneOrder()),
  toggleLaneWrap: () => dispatch(filterActions.toggleLaneWrap()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineRoute);
