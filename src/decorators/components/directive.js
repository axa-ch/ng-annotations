import utils from 'src/libs/utils';
import inject from 'src/decorators/utils/inject';

/**
 * @decorator: @directive
 * @type: function
 *
 * declares a new angular directive
 *
 * @param name (optional)  replaces the class name
 *
 * @returns {Function}
 */
export default function NgDirective(name = '') {
	return (target) => {
		name = name || target.name;

		var component = function(...injections) {
			let directive = new target(...injections);
			utils.applyTransformations(target, directive, injections);
            return directive;
		}

		if(!(target.$inject instanceof Array) || target.$inject.length === 0) {
			var parameters = utils.extractParameters(target);
			if(parameters.length > 0)
				inject(parameters)(component);
		}
		else inject(target.$inject)(component);


		utils.addDeclareMethod(target);
		utils.defineComponent(target, name, 'directive', component);
	}
}