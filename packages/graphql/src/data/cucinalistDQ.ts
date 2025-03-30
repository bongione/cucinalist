import dsl from '@cucinalist/dsl';
import {ExecutionContext} from './dmlTypes'


type FieldCondition = 'string' | {contains: string};

interface PositiveFilter {gblId: FieldCondition;
  name: FieldCondition;
};

type Filter = Partial<PositiveFilter & {
  NOT: Partial<PositiveFilter>;
}>;

export async function processDslQuery(selectStatement: dsl.SelectStatement, ctx: ExecutionContext) {
    const target = selectStatement.target;
    const filter: Filter = {};
    for (const condition of selectStatement.conditions) {
      const fieldName = condition.field === 'id' ? 'gblId' : condition.field;
      if (condition.type === 'SelectCondition') {
        if (condition.operator === 'LIKE') {
          filter[fieldName] = {
            contains: condition.value,
          }
        } else if (condition.operator === '=') {
          filter[fieldName] = condition.value
        } else if (condition.operator === '!=') {
          if (!('NOT' in filter)) {
            filter['NOT'] = {};
          }
          filter['NOT'][fieldName] = condition.value;
        }
      }
    }
    if (target === 'Recipe') {
      return ctx.prisma().recipe.findMany({where: filter});
    }
    throw new Error('Unsupported target');
}
