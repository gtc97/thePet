import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import { config } from '../../config';

const router = Router();

// 地理编码：地址→坐标
router.get('/geocode', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const address = req.query.address as string;
    if (!address) return res.json(success(null));

    // 调用高德地图API（生产环境需配置API Key）
    if (config.amap.apiKey) {
      const resp = await fetch(
        `https://restapi.amap.com/v3/geocode/geo?key=${config.amap.apiKey}&address=${encodeURIComponent(address)}`
      );
      const data: any = await resp.json();
      if (data.status === '1' && data.geocodes?.length > 0) {
        const loc: string[] = data.geocodes[0].location.split(',');
        return res.json(success({ longitude: parseFloat(loc[0]), latitude: parseFloat(loc[1]), formattedAddress: data.geocodes[0].formatted_address }));
      }
    }

    // 无API Key时返回模拟数据
    res.json(success({ longitude: 116.397428, latitude: 39.90923, formattedAddress: address }));
  } catch (err) { next(err); }
});

// 逆地理编码：坐标→地址
router.get('/reverse-geocode', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { longitude, latitude } = req.query;
    if (!longitude || !latitude) return res.json(success(null));

    if (config.amap.apiKey) {
      const resp = await fetch(
        `https://restapi.amap.com/v3/geocode/regeo?key=${config.amap.apiKey}&location=${longitude},${latitude}`
      );
      const data: any = await resp.json();
      if (data.status === '1') {
        return res.json(success({ address: data.regeocode?.formatted_address || '' }));
      }
    }

    res.json(success({ address: `${longitude},${latitude}` }));
  } catch (err) { next(err); }
});

// 路线规划
router.get('/route', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { origin, destination, type } = req.query;
    if (!origin || !destination) return res.json(success(null));

    const routeType = (type as string) === 'walking' ? 'walking' : 'driving';

    if (config.amap.apiKey) {
      const resp = await fetch(
        `https://restapi.amap.com/v3/direction/${routeType}?key=${config.amap.apiKey}&origin=${origin}&destination=${destination}`
      );
      const data: any = await resp.json();
      if (data.status === '1') {
        const route = data.route?.paths?.[0];
        return res.json(success({
          distance: route?.distance || 0,
          duration: route?.duration || 0,
          steps: route?.steps || [],
        }));
      }
    }

    // 模拟路线
    res.json(success({ distance: 2500, duration: 900, steps: [] }));
  } catch (err) { next(err); }
});

export default router;
