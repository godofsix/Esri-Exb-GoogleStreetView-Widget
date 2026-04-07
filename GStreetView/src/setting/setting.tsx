/** @jsx jsx */

import { React, css, jsx } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components'
import { Button } from 'jimu-ui'
import { type IMConfig } from '../config'
import defaultI18nMessages from './translations/default'

interface State {
  pendingMapId: string | null
}

export default class Setting extends React.PureComponent<
AllWidgetSettingProps<IMConfig>,
State
> {
  state: State = {
    pendingMapId: null
  }

  onPendingMapSelected = (ids: string[]) => {
    this.setState({ pendingMapId: ids?.[0] ?? null })
  }

  addSelectedMap = () => {
    const { pendingMapId } = this.state
    if (!pendingMapId) return

    const current: string[] = this.props.useMapWidgetIds
      ? [...(this.props.useMapWidgetIds as unknown as string[])]
      : []

    if (current.includes(pendingMapId)) return

    current.push(pendingMapId)
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: current
    })
    this.setState({ pendingMapId: null })
  }

  removeMap = (widgetId: string) => {
    const current: string[] = this.props.useMapWidgetIds
      ? [...(this.props.useMapWidgetIds as unknown as string[])]
      : []

    const updated = current.filter(id => id !== widgetId)
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: updated
    })
  }

  render () {
    const style = css`
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
    `

    const selectedIds: string[] = this.props.useMapWidgetIds
      ? [...(this.props.useMapWidgetIds as unknown as string[])]
      : []

    return (
      <div css={style}>
        <div className="widget-setting-gstreetview">
          <SettingSection
            className="map-selector-section"
            title={this.props.intl.formatMessage({
              id: 'mapWidgetLabel',
              defaultMessage: defaultI18nMessages.selectMapWidget
            })}
          >
            {selectedIds.length > 0 && (
              <div className="selected-maps">
                {selectedIds.map(id => (
                  <div key={id} className="map-item">
                    <span>{id}</span>
                    <Button size="sm" type="tertiary" onClick={() => this.removeMap(id)}>✕</Button>
                  </div>
                ))}
              </div>
            )}

            <SettingRow label={defaultI18nMessages.addMap}>
              <div className="add-row">
                <MapWidgetSelector
                  onSelect={this.onPendingMapSelected}
                  useMapWidgetIds={this.state.pendingMapId ? [this.state.pendingMapId] as any : undefined}
                />
              </div>
            </SettingRow>
            <SettingRow>
              <Button
                type="primary"
                size="sm"
                disabled={!this.state.pendingMapId}
                onClick={this.addSelectedMap}
              >
                {defaultI18nMessages.addMap}
              </Button>
            </SettingRow>

            <p className="info-text">
              {defaultI18nMessages.autoDetectInfo}
            </p>
          </SettingSection>
        </div>
      </div>
    )
  }
}
