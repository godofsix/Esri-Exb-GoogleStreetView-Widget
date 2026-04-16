System.register(["jimu-core","jimu-ui/advanced/setting-components","jimu-ui"],(function(e,t){var s={},i={},n={};return{setters:[function(e){s.React=e.React,s.css=e.css,s.jsx=e.jsx},function(e){i.MapWidgetSelector=e.MapWidgetSelector,i.SettingRow=e.SettingRow,i.SettingSection=e.SettingSection},function(e){n.Button=e.Button}],execute:function(){e((()=>{var e={4321:e=>{"use strict";e.exports=n},9244:e=>{"use strict";e.exports=s},9298:e=>{"use strict";e.exports=i}},t={};function a(s){var i=t[s];if(void 0!==i)return i.exports;var n=t[s]={exports:{}};return e[s](n,n.exports,a),n.exports}a.d=(e,t)=>{for(var s in t)a.o(t,s)&&!a.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.p="";var p={};return a.p=window.jimuConfig.baseUrl,(()=>{"use strict";a.r(p),a.d(p,{__set_webpack_public_path__:()=>d,default:()=>r});var e=a(9244),t=a(9298),s=a(4321);const i="Map Widgets",n="Add Map",o="Coordinate system (UTM, Lat/Long, etc.) is auto-detected from each map.";class r extends e.React.PureComponent{constructor(){super(...arguments),this.state={pendingMapId:null},this.onPendingMapSelected=e=>{var t;this.setState({pendingMapId:null!==(t=null==e?void 0:e[0])&&void 0!==t?t:null})},this.addSelectedMap=()=>{const{pendingMapId:e}=this.state;if(!e)return;const t=this.props.useMapWidgetIds?[...this.props.useMapWidgetIds]:[];t.includes(e)||(t.push(e),this.props.onSettingChange({id:this.props.id,useMapWidgetIds:t}),this.setState({pendingMapId:null}))},this.removeMap=e=>{const t=(this.props.useMapWidgetIds?[...this.props.useMapWidgetIds]:[]).filter((t=>t!==e));this.props.onSettingChange({id:this.props.id,useMapWidgetIds:t})}}render(){const a=e.css`
      .widget-setting-gstreetview {
        .info-text {
          font-size: 12px;
          color: var(--ref-palette-neutral-900);
          margin-top: 8px;
        }
        .selected-maps {
          margin-top: 8px;
          .map-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 8px;
            margin-bottom: 4px;
            background: var(--ref-palette-neutral-200);
            border-radius: 4px;
            font-size: 13px;
          }
        }
        .add-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }
      }
    `,p=this.props.useMapWidgetIds?[...this.props.useMapWidgetIds]:[];return(0,e.jsx)("div",{css:a},(0,e.jsx)("div",{className:"widget-setting-gstreetview"},(0,e.jsx)(t.SettingSection,{className:"map-selector-section",title:this.props.intl.formatMessage({id:"mapWidgetLabel",defaultMessage:i})},p.length>0&&(0,e.jsx)("div",{className:"selected-maps"},p.map((t=>(0,e.jsx)("div",{key:t,className:"map-item"},(0,e.jsx)("span",null,t),(0,e.jsx)(s.Button,{size:"sm",type:"tertiary",onClick:()=>this.removeMap(t)},"\u2715"))))),(0,e.jsx)(t.SettingRow,{label:n},(0,e.jsx)("div",{className:"add-row"},(0,e.jsx)(t.MapWidgetSelector,{onSelect:this.onPendingMapSelected,useMapWidgetIds:this.state.pendingMapId?[this.state.pendingMapId]:void 0}))),(0,e.jsx)(t.SettingRow,null,(0,e.jsx)(s.Button,{type:"primary",size:"sm",disabled:!this.state.pendingMapId,onClick:this.addSelectedMap},n)),(0,e.jsx)("p",{className:"info-text"},o))))}}function d(e){a.p=e}})(),p})())}}}));