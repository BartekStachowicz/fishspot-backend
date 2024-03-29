import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { LakeService } from '../lake/lake.service';
import { SpotOptions, Spots, SpotsInfo } from './spots.model';

@Injectable()
export class SpotsService {
  constructor(
    @Inject(forwardRef(() => LakeService)) private lakeService: LakeService,
  ) {}

  async addNewSpot(lakeName: string, spot: Spots): Promise<string> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const id = this.buildUniqueID(lakeName, spot.number);

      const newSpot: Spots = {
        ...spot,
        spotId: id,
      };

      lake.spots.push(newSpot);

      await this.lakeService.updateLake(lake);
      await this.lakeService.backupJSON();
      return id;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można dodać stanowiska!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSpot(lakeName: string, spot: Spots): Promise<Spots> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const spotIndex = lake.spots.findIndex((s) => s.spotId === spot.spotId);

      if (spotIndex === -1) {
        throw new HttpException(
          'Nie można odnaleźć stanowiska!',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedSpot: Spots = {
        ...lake.spots[spotIndex],
        ...spot,
      };

      lake.spots.splice(spotIndex, 1, updatedSpot);

      await this.lakeService.updateLake(lake);
      await this.lakeService.backupJSON();
      return updatedSpot;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można zaktualizować stanowiska!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAllSpots(
    lakeName: string,
    inputData: { info: SpotsInfo; options: SpotOptions },
  ) {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );

      const updatedSpots: Spots[] = lake.spots.map((spot) => {
        return {
          ...spot,
          info: {
            ...spot.info,
            priceList: inputData.info.priceList,
            spotCapacity: inputData.info.spotCapacity,
          },
          options: inputData.options,
        };
      });

      lake.spots = updatedSpots;
      await this.lakeService.updateLake(lake);
      await this.lakeService.backupJSON();
      return updatedSpots;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można zaktualizować stanowisk!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpot(lakeName: string, spotId: string): Promise<void> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      lake.spots.filter((spot) => spot.spotId !== spotId);

      await this.lakeService.updateLake(lake);
      await this.lakeService.backupJSON();
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można usunać stanowiska!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpotById(
    lakeName: string,
    spotId: string,
  ): Promise<{
    spotId: string;
    number: string;
    info: SpotsInfo;
    options: SpotOptions;
  }> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const spotOutput: Spots = lake.spots.find(
        (spot) => spot.spotId === spotId,
      );

      return {
        spotId: spotOutput.spotId,
        number: spotOutput.number,
        info: spotOutput.info,
        options: spotOutput.options,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać stanowiska!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /////////////FOR DEVELOPING

  async regenerateSpotId(lakeName: string) {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      lake.spots.map((spot) => {
        spot.spotId = this.buildUniqueID(lakeName, spot.number);
      });

      await this.lakeService.updateLake(lake);
    } catch (error) {
      console.log(error);
    }
  }

  ///FOR TESTING

  public genereteNewSpot(spotNumber: string, lakeName: string): Spots {
    try {
      const spot: Spots = {
        spotId: this.buildUniqueID(lakeName, spotNumber),
        number: spotNumber,
        unavailableDates: {
          '2023': [],
        },
        info: {
          priceList: {
            options: {
              weekend: true,
            },
            default: {
              priceDay: 100,
              priceNight: 100,
            },
            weekend: {
              priceDay: 150,
              priceNight: 150,
            },
            specials: [],
          },
          description: 'opis',
          houseSpot: false,
          houseSpotPrice: {
            priceForMinimal: 200,
            minNumberOfDays: 2,
            priceForExtraDay: 200,
          },
          spotCapacity: 1,
        },
        options: {
          isDepositRequire: false,
          depositValue: '50%',
          depositRequiredSince: 2,
          depositTerms: 0,
        },
      };

      return spot;
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////////////

  public buildUniqueID(lakeName: string, number: string): string {
    const uuid = uuidv4();
    const name =
      '$LN' + lakeName.charAt(0) + lakeName.charAt(lakeName.length - 1);

    const id = `${name.toUpperCase()}.${number}.${uuid}`;
    return id;
  }
}
