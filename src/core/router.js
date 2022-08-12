import {
  BookOutlined,
  HomeOutlined,
  StarOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';

function getItem(label, key, icon, children, onClick) {
  return {
    key,
    icon,
    children,
    label,
    onClick
  };
}

export const routes = [
  getItem('Home', '1', <HomeOutlined />, null, () => console.log('oke')),
  getItem('Book', '2', <BookOutlined />, null, () => {console.log('oke')}),
  getItem('Visitor', '3', <UsergroupAddOutlined />, null, () => {console.log('oke')}),
  getItem('Favorite', '4', <StarOutlined />, null, () => console.log('oke')),
];

export const routesNoLayout = ['/login']
