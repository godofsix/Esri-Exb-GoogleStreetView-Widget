/* eslint-disable no-prototype-builtins */
/** @jsx jsx */

import { React, type AllWidgetProps, jsx, WidgetState } from 'jimu-core'
import { type IMConfig } from '../config'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'

import type Point from 'esri/geometry/Point'

import defaultMessages from './translations/default'

interface IState {
  latitude: string
  longitude: string
  zoom: number
  scale: number
  mapViewReady: boolean
  widgetEnabled: boolean
  detectedCoordSystem: string
}

// Unique CSS class used to force the custom cursor via a <style> tag
const CURSOR_CLASS = 'gstreetview-cursor-active'
// 32×32 pegman cursor encoded as a data URI
const STREETVIEW_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 480 480'%3E%3Cpath d='M328 363.8c-5.4-1.2-10.7 2.2-11.9 7.6-1.2 5.4 2.2 10.7 7.6 11.9 42.5 9.5 61.9 24.4 61.9 34.1 0 6.7-10.2 18-38.8 27.7C318.4 454.7 280.5 460 240 460s-78.4-5.3-106.8-14.9c-28.6-9.7-38.8-21-38.8-27.7 0-9.3 17.1-23 55.4-32.5 5.4-1.3 8.6-6.8 7.3-12.1-1.3-5.4-6.8-8.6-12.1-7.3C99.5 376.9 74.4 395.3 74.4 417.4c0 13.2 9.1 32 52.4 46.6C157.2 474.3 197.4 480 240 480s82.8-5.7 113.2-15.9c43.3-14.6 52.4-33.4 52.4-46.6 0-23.4-27.5-42.4-77.6-53.7z'/%3E%3Cpath d='M172.3 293.7h12.6v102.9c0 5.5 4.5 10 10 10h90.3c5.5 0 10-4.5 10-10V293.7h12.6c5.5 0 10-4.5 10-10V103.1c0-5.5-4.5-10-10-10h-29.2c9.4-9.9 15.2-23.3 15.2-38C293.7 24.7 269 0 238.6 0c-30.4 0-55.2 24.7-55.2 55.1 0 14.7 5.8 28.1 15.2 38h-26.4c-5.5 0-10 4.5-10 10v180.6c0 5.5 4.5 10 10 10zm66.3-273.7c19.4 0 35.1 15.8 35.1 35.1 0 19.4-15.8 35.2-35.1 35.2-19.4 0-35.2-15.8-35.2-35.2 0-19.4 15.8-35.1 35.2-35.1zM182.3 113.1h115.4v160.6h-12.6c-5.5 0-10 4.5-10 10v102.9H250v-91.6c0-5.5-4.5-10-10-10s-10 4.5-10 10v91.6h-25.1V283.7c0-5.5-4.5-10-10-10h-12.6V113.1z'/%3E%3C/svg%3E") 16 16, crosshair`

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  IState
> {
  private mapViews: Map<string, JimuMapView> = new Map()
  private cursorStyleEl: HTMLStyleElement | null = null

  state = {
    latitude: '',
    longitude: '',
    zoom: 0,
    scale: 0,
    mapViewReady: false,
    widgetEnabled: false,
    detectedCoordSystem: ''
  }

  componentWillUnmount () {
    this.removeCursorStyle()
  }

  toggleWidget = () => {
    this.setState(prevState => {
      const nowEnabled = !prevState.widgetEnabled
      this.updateMapCursors(nowEnabled)
      return { widgetEnabled: nowEnabled }
    })
  }

  private ensureCursorStyle = () => {
    if (this.cursorStyleEl) return
    const style = document.createElement('style')
    style.textContent = `.${CURSOR_CLASS} .esri-view-surface, .${CURSOR_CLASS} .esri-view-surface * { cursor: ${STREETVIEW_CURSOR} !important; }`
    document.head.appendChild(style)
    this.cursorStyleEl = style
  }

  private removeCursorStyle = () => {
    if (this.cursorStyleEl) {
      this.cursorStyleEl.remove()
      this.cursorStyleEl = null
    }
  }

  private updateMapCursors = (enabled: boolean) => {
    if (enabled) {
      this.ensureCursorStyle()
    }
    this.mapViews.forEach(jmv => {
      if (jmv?.view?.container) {
        if (enabled) {
          jmv.view.container.classList.add(CURSOR_CLASS)
        } else {
          jmv.view.container.classList.remove(CURSOR_CLASS)
        }
      }
    })
    if (!enabled) {
      this.removeCursorStyle()
    }
  }

  /**
   * Opens Google Street View after ensuring the point is in WGS84.
   * Auto-detects whether the map is in Lat/Long, Web Mercator, or a projected
   * coordinate system (UTM, State Plane, etc.) and projects if needed.
   */
  private openStreetViewForPoint = (point: Point) => {
    const sr = point.spatialReference

    // WGS84 or Web Mercator — the Point .longitude/.latitude getters work directly
    if (sr.isGeographic || sr.isWebMercator) {
      const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${point.latitude},${point.longitude}`
      window.open(streetViewUrl, '_blank')
      return
    }

    // Projected coordinate system (UTM, State Plane, etc.) — project to WGS84
    try {
      const requireFunc = (window as any).require
      requireFunc(
        ['esri/geometry/projection', 'esri/geometry/SpatialReference'],
        (projectionModule: any, SpatialReference: any) => {
          projectionModule.load().then(() => {
            const wgs84 = new SpatialReference({ wkid: 4326 })
            const geoPoint = projectionModule.project(point, wgs84)
            if (geoPoint) {
              const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${geoPoint.y},${geoPoint.x}`
              window.open(streetViewUrl, '_blank')
            } else {
              console.error('GStreetView: projection returned null — check map spatial reference')
            }
          }).catch((err: any) => {
            console.error('GStreetView: projection load failed', err)
          })
        }
      )
    } catch (err) {
      console.error('GStreetView: failed to load projection modules', err)
    }
  }

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      // Track this map view and apply cursor if widget is already enabled
      this.mapViews.set(jmv.id, jmv)
      if (this.state.widgetEnabled && jmv.view?.container) {
        this.ensureCursorStyle()
        jmv.view.container.classList.add(CURSOR_CLASS)
      }

      // Detect coordinate system for display
      const sr = jmv.view.spatialReference
      let coordLabel = `WKID ${sr.wkid}`
      if (sr.isGeographic) {
        coordLabel = 'Lat/Long'
      } else if (sr.isWebMercator) {
        coordLabel = 'Web Mercator'
      } else {
        coordLabel = `Projected (WKID ${sr.wkid})`
      }
      this.setState({ detectedCoordSystem: coordLabel })

      // When the extent moves, update the state with all the updated values.
      jmv.view.watch('extent', () => {
        this.setState({
          latitude: jmv.view.center.latitude.toFixed(3),
          longitude: jmv.view.center.longitude.toFixed(3),
          scale: Math.round(jmv.view.scale * 1) / 1,
          zoom: jmv.view.zoom,
          mapViewReady: true
        })
      })

      // Listen for click event to generate the URL and open it
      jmv.view.on('click', evt => {
        if (!this.state.widgetEnabled) return

        const point: Point = jmv.view.toMap({
          x: evt.x,
          y: evt.y
        })

        this.openStreetViewForPoint(point)
      })
    }
  }

  render () {
    const message = (
      <p style={{ marginBottom: '2px', fontWeight: 'bold' }}>
        Click anywhere on the map for Google Street View
      </p>
    )

    const isInController = this.props.state === WidgetState.Opened

    const containerStyle: React.CSSProperties = isInController
      ? {
          backgroundColor: '#2b2b2b',
          color: '#e0e0e0',
          borderRadius: '4px',
          padding: '8px'
        }
      : {}

    const enabledButtonStyle: React.CSSProperties = {
      backgroundColor: '#1a7a2e',
      color: '#fff',
      border: '1px solid #156325',
      borderRadius: '4px',
      padding: '4px 12px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }

    const disabledButtonStyle: React.CSSProperties = {
      backgroundColor: isInController ? '#444' : '#e0e0e0',
      color: isInController ? '#e0e0e0' : '#333',
      border: isInController ? '1px solid #666' : '1px solid #ccc',
      borderRadius: '4px',
      padding: '4px 12px',
      cursor: 'pointer'
    }

    const buttonStyle = this.state.widgetEnabled ? enabledButtonStyle : disabledButtonStyle

    return (
      <div className="widget-get-map-coordinates jimu-widget m-2" style={containerStyle}>

        {/* Render a JimuMapViewComponent for EACH selected map widget */}
        {this.props.hasOwnProperty('useMapWidgetIds') &&
          this.props.useMapWidgetIds &&
          this.props.useMapWidgetIds.length > 0 &&
          this.props.useMapWidgetIds.map((widgetId: string) => (
            <JimuMapViewComponent
              key={widgetId}
              useMapWidgetId={widgetId}
              onActiveViewChange={this.activeViewChangeHandler}
            />
          ))}

        {message}

        <button onClick={this.toggleWidget} style={buttonStyle}>
          {this.state.widgetEnabled ? '● Enabled' : 'Enable Widget'}
        </button>
      </div>
    )
  }
}
