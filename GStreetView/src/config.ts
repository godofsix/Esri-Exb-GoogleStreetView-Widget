import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  showZoom: boolean
  showScale: boolean
}

export type IMConfig = ImmutableObject<Config>
