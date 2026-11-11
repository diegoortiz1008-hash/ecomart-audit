import moment from 'moment'
import 'moment/dist/locale/es'
import _ from 'lodash'

moment.locale('es')

export const formatPrice = (cop: number) => '$ ' + _.round(cop).toLocaleString('es-CO')
export const formatDate = (iso: string) => moment(iso).format('LL')
export const fromNow = (iso: string) => moment(iso).fromNow()
export const groupByCategory = <T extends { category: string }>(items: T[]) => _.groupBy(items, 'category')
export const sortByPrice = <T extends { priceCop: number }>(items: T[]) => _.sortBy(items, 'priceCop')
