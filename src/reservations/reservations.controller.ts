import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { ReservationData } from './reservations.model';
import { JwtGuard } from '../auth/jwt.guard';
import { MailService } from 'src/mails/mails.service';
import { CompetitionData } from './competition.model';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private reservationsService: ReservationsService,
    private mailService: MailService,
  ) {}

  @Post(':lakename')
  async createNewReservation(
    @Param('lakename') lakeName: string,
    @Body() reservation: ReservationData,
  ): Promise<ReservationData> {
    const newReservation = await this.reservationsService.createNewReservations(
      lakeName,
      reservation,
    );
    this.mailService.prepareAndSendEmail(
      {
        ...newReservation,
        email: reservation.email,
        fullName: reservation.fullName,
      },
      'pending',
      lakeName,
    );
    return newReservation;
  }

  @UseGuards(JwtGuard)
  @Post(':lakename/competition')
  async addCompetition(
    @Param('lakename') lakeName: string,
    @Body() competition: CompetitionData,
  ) {
    await this.reservationsService.createCompetition(lakeName, competition);
  }

  @UseGuards(JwtGuard)
  @Delete('delete/:lakename/competition/:id')
  async deleteCompetition(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ) {
    await this.reservationsService.deleteCompetition(lakeName, id);
  }

  @UseGuards(JwtGuard)
  @Put('update/:lakename/:id')
  async updateReservation(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
    @Body() reservation: ReservationData,
  ): Promise<ReservationData> {
    const updatedReservation = await this.reservationsService.updateReservation(
      lakeName,
      id,
      reservation,
    );
    this.mailService.prepareAndSendEmail(
      updatedReservation,
      'confirmed',
      lakeName,
    );
    return updatedReservation;
  }

  @Get('one/:lakename/:id')
  async getReservationByID(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ): Promise<ReservationData> {
    const reservation = await this.reservationsService.getReservationByID(
      lakeName,
      id,
    );
    return reservation;
  }
  @UseGuards(JwtGuard)
  @Get('not-confirmed/:lakename')
  async getNotConfirmedReservations(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Param('lakename') lakeName: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getNotConfirmedReservations(
        lakeName,
        +offset,
        +limit,
        filter,
        year,
      );
    return reservations;
  }
  @UseGuards(JwtGuard)
  @Get('confirmed/:lakename/:year')
  async getAllReservationsByYear(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Param('lakename') lakeName: string,
    @Param('year') year: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getAllReservationsByYear(
        lakeName,
        year,
        +offset,
        +limit,
        filter,
      );
    return reservations;
  }
  @UseGuards(JwtGuard)
  @Get('byspots/:lakename/:spotId')
  async getReservationsBySpotsId(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Param('lakename') lakeName: string,
    @Param('spotId') spotId: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getReservationsBySpotsId(
        lakeName,
        spotId,
        +offset,
        +limit,
        filter,
        year,
      );
    return reservations;
  }

  @UseGuards(JwtGuard)
  @Get('todays/:lakename')
  async getTodaysReservations(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Query('date') date: string,
    @Param('lakename') lakeName: string,
  ): Promise<ReservationData[] | void> {
    const reservations = await this.reservationsService.getTodaysReservations(
      lakeName,
      +offset,
      +limit,
      filter,
      year,
      date,
    );
    return reservations;
  }

  @UseGuards(JwtGuard)
  @Get('todaysall')
  async getTodaysReservationsCombined(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Query('date') date: string,
  ): Promise<ReservationData[] | void> {
    const reservations =
      await this.reservationsService.getTodaysReservationsCombined(
        +offset,
        +limit,
        filter,
        year,
        date,
      );
    return reservations;
  }

  @UseGuards(JwtGuard)
  @Get('deposit-paid/:lakename')
  async getReservationsWithPaidDeposit(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Param('lakename') lakeName: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getReservationsWithPaidDeposit(
        lakeName,
        +offset,
        +limit,
        filter,
        year,
      );
    return reservations;
  }
  @UseGuards(JwtGuard)
  @Get('deposit-non-paid/:lakename')
  async getReservationsWithRequireDeposit(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('year') year: string,
    @Param('lakename') lakeName: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getReservationsWithRequireDeposit(
        lakeName,
        +offset,
        +limit,
        filter,
        year,
      );
    return reservations;
  }
  @UseGuards(JwtGuard)
  @Delete('delete/:lakename/:id')
  async deleteReservation(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ) {
    const reservation = await this.reservationsService.deleteReservation(
      lakeName,
      id,
    );

    this.mailService.prepareAndSendEmail(reservation, 'rejected', lakeName);
  }

  @UseGuards(JwtGuard)
  @Delete('delete-confirmed/:lakename/:id')
  async deleteConfirmedReservation(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ) {
    await this.reservationsService.deleteReservation(lakeName, id);
  }

  // @Delete('clear')
  // async cleaner() {
  //   await this.reservationsService.cleanExpiredReservations();
  // }
}
