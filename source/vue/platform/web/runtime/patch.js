import { createPatchFunction } from '../../../core/vdom/patch'
import * as nodeOps from './node-ops'

export const patch = createPatchFunction({
    nodeOps
})