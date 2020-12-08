// @flow

/* global document */

import { invariant, warning } from '@adeira/js';
import { compile, serialize, stringify, prefixer, middleware } from 'stylis';

import StyleCollectorAtNode from './StyleCollectorAtNode';
import StyleCollectorNode from './StyleCollectorNode';
import StyleCollectorPseudoNode from './StyleCollectorPseudoNode';
import type { StyleBufferType } from './StyleCollector';

// <style data-adeira-sx />
opaque type StyleElementType = HTMLStyleElement | null;
let styleAdeiraSXTag: StyleElementType = null;

const getStyleTag = (): CSSStyleSheet => {
  if (styleAdeiraSXTag === null) {
    styleAdeiraSXTag = ((document.querySelector('style[data-adeira-sx]'): any): StyleElementType);
    if (styleAdeiraSXTag === null) {
      // Still `null` so let's create the style element:
      const htmlHead = document.head;
      styleAdeiraSXTag = document.createElement('style');
      styleAdeiraSXTag.type = 'text/css';
      styleAdeiraSXTag.setAttribute('data-adeira-sx', '');
      htmlHead?.appendChild(styleAdeiraSXTag);
    }
  }

  const styleSheet = styleAdeiraSXTag.sheet;

  invariant(
    styleSheet != null,
    'SX cannot apply runtime styles because HTMLStyleElement.sheet does not exist.',
  );

  return styleSheet;
};

function hasStyleRule(match: (CSSRule) => boolean) {
  const styleSheet = getStyleTag();
  for (const cssRule of styleSheet.cssRules) {
    if (match(cssRule)) {
      return true;
    }
  }
  return false;
}

export function injectRuntimeKeyframes(css: string, name: string) {
  const styleSheet = getStyleTag();

  const matchFunction = (cssRule) => {
    if (cssRule.type === CSSRule.KEYFRAMES_RULE) {
      const rule: CSSKeyframesRule = (cssRule: any);
      return rule.name === name;
    }
    return false;
  };

  if (hasStyleRule(matchFunction) === false) {
    const rules = [];
    serialize(compile(css), middleware([prefixer, (rule) => rules.push(rule)]));

    rules.forEach((rule) => {
      styleSheet.insertRule(serialize([rule], stringify), styleSheet.cssRules.length);
    });
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
export default function injectRuntimeStyles(styleBuffer: StyleBufferType) {
  const styleSheet = getStyleTag();

  const matchFunction = (node) => (cssRule) => {
    if (cssRule.type === CSSRule.STYLE_RULE) {
      const styleRule = ((cssRule: any): CSSStyleRule);
      if (styleRule.selectorText === `.${node.getHash()}`) {
        return true;
      }
    }
    return false;
  };

  styleBuffer.forEach((node) => {
    const insertIndex = styleSheet.cssRules.length;

    if (node instanceof StyleCollectorNode) {
      if (hasStyleRule(matchFunction(node)) === false) {
        // apply missing styles
        const rule = serialize(
          compile(node.printNodes({ trailingSemicolon: true }).join('')),
          middleware([prefixer, stringify]),
        );
        styleSheet.insertRule(rule, insertIndex);
      }
    } else if (node instanceof StyleCollectorAtNode) {
      // TODO: make sure we are not adding already added styles (?)
      const rule = serialize(
        compile(node.printNodes({ trailingSemicolon: true }).join('')),
        middleware([prefixer, stringify]),
      );
      styleSheet.insertRule(rule, insertIndex);
    } else if (node instanceof StyleCollectorPseudoNode) {
      const nodes = node.printNodes({ trailingSemicolon: true });
      for (const nodeElement of nodes) {
        // TODO: make sure we are not adding already added styles (?)
        const rule = serialize(compile(nodeElement), middleware([prefixer, stringify]));
        styleSheet.insertRule(rule, insertIndex);
      }
    } else {
      warning(false, 'Node not supported in runtime styles: %j', node);
    }
  });
}
