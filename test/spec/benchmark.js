import test from 'ava';
import { Suite } from 'benchmark';
import AbstractSyntaxTree from '../../index';

test.cb('it favors inline code over template method usage in hot paths if not memoized', t => {
    let ast = new AbstractSyntaxTree("console.log(1);");
    let suite = new Suite();
    suite
    .add('template#string', function() {
        ast.template("var add = function (a, b) { return a + b; }");
    })
    .add('template#expression', function() {
        ast.template("var add = <%= fn %>", { fn:  ast.template(function (a, b) { return a + b; }) });
    })
    .add('template#inline', function () {
        [{
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'add' },
            init: ast.template(function (a, b) { return a + b; })
        }];
    })
    .on('complete', function() {
        t.truthy(this.filter('fastest').map('name')[0] === 'template#inline');
        t.end();
    })
    .run({ 'async': true });
});

