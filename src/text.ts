import Base from './base';
import attachMethodsToInstance from './base/attachMethodsToInstance';
import { Render } from './system/render';
import { ComponentType, CSSRules } from './types';

const textInstance = new Base({
  as: 'span'
});

const Text = ((props: CSSRules): Render => {
  return textInstance.render(props);
}) as ComponentType;

attachMethodsToInstance(Text, textInstance);

Text.displayName = 'Text';

export default Text;
